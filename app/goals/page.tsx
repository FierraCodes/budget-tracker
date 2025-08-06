"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Target, Calendar, DollarSign, Edit, Trash2, TrendingUp, Link, Unlink } from 'lucide-react'

interface Account {
  id: string
  name: string
  balance: number
  type: "checking" | "savings" | "credit" | "investment"
}

interface SavingsGoal {
  id: string
  name: string
  description: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category: string
  priority: "High" | "Medium" | "Low"
  linkedAccountId?: string // New field for account linking
  trackingMode: "manual" | "account" // New field for tracking mode
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showContributeDialog, setShowContributeDialog] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(null)
  const [contributionAmount, setContributionAmount] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
    category: "",
    priority: "Medium" as "High" | "Medium" | "Low",
    trackingMode: "manual" as "manual" | "account",
    linkedAccountId: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedGoals = localStorage.getItem("money-manager-goals")
        const savedAccounts = localStorage.getItem("money-manager-accounts")
        
        if (savedGoals) {
          const parsedGoals = JSON.parse(savedGoals)
          setGoals(Array.isArray(parsedGoals) ? parsedGoals : [])
        }
        if (savedAccounts) {
          const parsedAccounts = JSON.parse(savedAccounts)
          setAccounts(Array.isArray(parsedAccounts) ? parsedAccounts : [])
        }
      } catch (error) {
        console.error("Error loading goals:", error)
      }
    }
  }, [])

  // Update goals with linked account balances
  useEffect(() => {
    if (goals.length > 0 && accounts.length > 0) {
      const updatedGoals = goals.map(goal => {
        if (goal.trackingMode === "account" && goal.linkedAccountId) {
          const linkedAccount = accounts.find(acc => acc.id === goal.linkedAccountId)
          if (linkedAccount) {
            return {
              ...goal,
              currentAmount: Math.max(0, linkedAccount.balance) // Don't allow negative amounts for goals
            }
          }
        }
        return goal
      })

      // Only update if there are actual changes
      const hasChanges = updatedGoals.some((goal, index) => 
        goal.currentAmount !== goals[index].currentAmount
      )

      if (hasChanges) {
        setGoals(updatedGoals)
        if (typeof window !== "undefined") {
          localStorage.setItem("money-manager-goals", JSON.stringify(updatedGoals))
        }
      }
    }
  }, [accounts]) // Only depend on accounts to avoid infinite loops

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.targetAmount || !formData.targetDate || typeof window === "undefined") return

    try {
      let currentAmount = Number.parseFloat(formData.currentAmount) || 0

      // If linking to an account, use the account balance as current amount
      if (formData.trackingMode === "account" && formData.linkedAccountId) {
        const linkedAccount = accounts.find(acc => acc.id === formData.linkedAccountId)
        if (linkedAccount) {
          currentAmount = Math.max(0, linkedAccount.balance)
        }
      }

      const goal: SavingsGoal = {
        id: editingGoal ? editingGoal.id : Date.now().toString(),
        name: formData.name,
        description: formData.description,
        targetAmount: Number.parseFloat(formData.targetAmount),
        currentAmount,
        targetDate: formData.targetDate,
        category: formData.category,
        priority: formData.priority,
        trackingMode: formData.trackingMode,
        linkedAccountId: formData.trackingMode === "account" ? formData.linkedAccountId : undefined,
      }

      let updatedGoals: SavingsGoal[]
      if (editingGoal) {
        updatedGoals = goals.map((g) => (g.id === goal.id ? goal : g))
      } else {
        updatedGoals = [...goals, goal]
      }

      setGoals(updatedGoals)
      localStorage.setItem("money-manager-goals", JSON.stringify(updatedGoals))

      // Reset form
      setFormData({
        name: "",
        description: "",
        targetAmount: "",
        currentAmount: "",
        targetDate: "",
        category: "",
        priority: "Medium",
        trackingMode: "manual",
        linkedAccountId: "",
      })
      setShowAddDialog(false)
      setEditingGoal(null)
    } catch (error) {
      console.error("Error saving goal:", error)
    }
  }

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault()

    if (!contributingGoal || !contributionAmount || typeof window === "undefined") return

    try {
      const amount = Number.parseFloat(contributionAmount)
      
      if (contributingGoal.trackingMode === "account" && contributingGoal.linkedAccountId) {
        // Update the linked account balance
        const updatedAccounts = accounts.map(acc => {
          if (acc.id === contributingGoal.linkedAccountId) {
            return { ...acc, balance: acc.balance + amount }
          }
          return acc
        })
        setAccounts(updatedAccounts)
        localStorage.setItem("money-manager-accounts", JSON.stringify(updatedAccounts))
        
        // The goal will be automatically updated via useEffect
      } else {
        // Manual tracking - update goal directly
        const updatedGoals = goals.map((g) =>
          g.id === contributingGoal.id 
            ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) } 
            : g
        )
        setGoals(updatedGoals)
        localStorage.setItem("money-manager-goals", JSON.stringify(updatedGoals))
      }

      setContributionAmount("")
      setShowContributeDialog(false)
      setContributingGoal(null)
    } catch (error) {
      console.error("Error adding contribution:", error)
    }
  }

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      description: goal.description,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: goal.targetDate,
      category: goal.category,
      priority: goal.priority,
      trackingMode: goal.trackingMode || "manual",
      linkedAccountId: goal.linkedAccountId || "",
    })
    setShowAddDialog(true)
  }

  const handleDelete = (goalId: string) => {
    if (typeof window === "undefined") return

    try {
      const updatedGoals = goals.filter((g) => g.id !== goalId)
      setGoals(updatedGoals)
      localStorage.setItem("money-manager-goals", JSON.stringify(updatedGoals))
    } catch (error) {
      console.error("Error deleting goal:", error)
    }
  }

  const handleContributeClick = (goal: SavingsGoal) => {
    setContributingGoal(goal)
    setShowContributeDialog(true)
  }

  const toggleGoalTracking = (goal: SavingsGoal) => {
    const newTrackingMode = goal.trackingMode === "manual" ? "account" : "manual"
    const updatedGoal = {
      ...goal,
      trackingMode: newTrackingMode,
      linkedAccountId: newTrackingMode === "manual" ? undefined : goal.linkedAccountId,
    }

    const updatedGoals = goals.map(g => g.id === goal.id ? updatedGoal : g)
    setGoals(updatedGoals)
    
    if (typeof window !== "undefined") {
      localStorage.setItem("money-manager-goals", JSON.stringify(updatedGoals))
    }
  }

  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900"
      case "Medium":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900"
      case "Low":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900"
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900"
    }
  }

  const getTimeRemaining = (targetDate: string) => {
    const target = new Date(targetDate)
    const now = new Date()
    const diffTime = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Overdue"
    if (diffDays === 0) return "Due today"
    if (diffDays === 1) return "1 day left"
    if (diffDays < 30) return `${diffDays} days left`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months left`
    return `${Math.ceil(diffDays / 365)} years left`
  }

  const getLinkedAccountName = (accountId?: string) => {
    if (!accountId) return null
    const account = accounts.find(acc => acc.id === accountId)
    return account?.name || "Unknown Account"
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Savings Goals</h1>
          <p className="text-muted-foreground">Track your progress towards financial goals</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingGoal ? "Edit Goal" : "Add Savings Goal"}</DialogTitle>
              <DialogDescription>
                {editingGoal
                  ? "Update your savings goal details."
                  : "Create a new savings goal to track your progress."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-field">
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Emergency Fund, Vacation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your goal..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-field">
                <Label htmlFor="trackingMode">Tracking Mode</Label>
                <Select
                  value={formData.trackingMode}
                  onValueChange={(value: "manual" | "account") => 
                    setFormData({ ...formData, trackingMode: value, linkedAccountId: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Updates</SelectItem>
                    <SelectItem value="account">Link to Account</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.trackingMode === "manual" 
                    ? "You'll manually add money to this goal"
                    : "Goal progress will automatically sync with the linked account balance"
                  }
                </p>
              </div>

              {formData.trackingMode === "account" && (
                <div className="form-field">
                  <Label htmlFor="linkedAccount">Linked Account</Label>
                  <Select
                    value={formData.linkedAccountId}
                    onValueChange={(value) => setFormData({ ...formData, linkedAccountId: value })}
                    required={formData.trackingMode === "account"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account to link" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts
                        .filter(acc => acc.type === "savings" || acc.type === "checking")
                        .map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} (${account.balance.toFixed(2)})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Only savings and checking accounts can be linked to goals
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="form-field">
                  <Label htmlFor="targetAmount">Target Amount</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    required
                  />
                </div>

                {formData.trackingMode === "manual" && (
                  <div className="form-field">
                    <Label htmlFor="currentAmount">Current Amount</Label>
                    <Input
                      id="currentAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.currentAmount}
                      onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="form-field">
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-field">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Travel, Emergency"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: "High" | "Medium" | "Low") => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false)
                    setEditingGoal(null)
                    setFormData({
                      name: "",
                      description: "",
                      targetAmount: "",
                      currentAmount: "",
                      targetDate: "",
                      category: "",
                      priority: "Medium",
                      trackingMode: "manual",
                      linkedAccountId: "",
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingGoal ? "Update" : "Add"} Goal</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
            <p className="text-xs text-muted-foreground">
              {goals.filter(g => g.trackingMode === "account").length} linked to accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalTargetAmount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved So Far</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${totalCurrentAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress.toFixed(1)}%</div>
            <div className="mt-2">
              <div className="progress-bar">
                <div className="progress-fill savings-progress" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      {goals.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
            const remaining = goal.targetAmount - goal.currentAmount
            const linkedAccountName = getLinkedAccountName(goal.linkedAccountId)

            return (
              <Card key={goal.id} className="goal-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                        {goal.trackingMode === "account" && (
                          <div className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                            <Link className="h-3 w-3" />
                            <span>Linked</span>
                          </div>
                        )}
                      </div>
                      <CardDescription>{goal.description}</CardDescription>
                      {linkedAccountName && (
                        <p className="text-xs text-muted-foreground">
                          Linked to: {linkedAccountName}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                      {goal.priority}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>

                  <div className="progress-bar">
                    <div className="progress-fill savings-progress" style={{ width: `${progress}%` }} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        ${goal.currentAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target</p>
                      <p className="font-semibold">${goal.targetAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{getTimeRemaining(goal.targetDate)}</span>
                    </div>
                    <span className="text-muted-foreground">${remaining.toLocaleString()} to go</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleContributeClick(goal)}
                      disabled={goal.currentAmount >= goal.targetAmount}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {goal.trackingMode === "account" ? "Add to Account" : "Add Money"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleGoalTracking(goal)}
                      title={goal.trackingMode === "account" ? "Switch to manual tracking" : "Link to account"}
                    >
                      {goal.trackingMode === "account" ? <Unlink className="h-4 w-4" /> : <Link className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No savings goals yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first savings goal to start tracking your financial progress.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Contribute Dialog */}
      <Dialog open={showContributeDialog} onOpenChange={setShowContributeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {contributingGoal?.trackingMode === "account" ? "Add Money to Account" : "Add Money to Goal"}
            </DialogTitle>
            <DialogDescription>
              {contributingGoal?.trackingMode === "account" 
                ? `Add money to the linked account "${getLinkedAccountName(contributingGoal?.linkedAccountId)}" to update your goal progress.`
                : `Add money to "${contributingGoal?.name}" goal.`
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContribute} className="space-y-4">
            <div className="form-field">
              <Label htmlFor="contribution">Amount to Add</Label>
              <Input
                id="contribution"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                required
              />
            </div>

            {contributingGoal && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span>Current:</span>
                  <span>${contributingGoal.currentAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Target:</span>
                  <span>${contributingGoal.targetAmount.toLocaleString()}</span>
                </div>
                {contributionAmount && (
                  <div className="flex justify-between text-sm font-medium border-t pt-2">
                    <span>New Total:</span>
                    <span>
                      $
                      {Math.min(
                        contributingGoal.currentAmount + Number.parseFloat(contributionAmount || "0"),
                        contributingGoal.targetAmount,
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
                {contributingGoal.trackingMode === "account" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    This will be added to your linked account balance.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowContributeDialog(false)
                  setContributingGoal(null)
                  setContributionAmount("")
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Add Money</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
