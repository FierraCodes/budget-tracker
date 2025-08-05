"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, ArrowLeft, Wallet, Target, DollarSign } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

interface Account {
  id: string
  name: string
  balance: number
  type: "checking" | "savings" | "credit" | "investment"
}

interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  trackingMode: "manual" | "account"
  trackedAccountId?: string
}

export default function GoalsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [contributionDialogGoal, setContributionDialogGoal] = useState<SavingsGoal | null>(null)
  const [contributionAmount, setContributionAmount] = useState("")
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
    trackingMode: "manual" as "manual" | "account",
    trackedAccountId: "",
  })

  useEffect(() => {
    const savedAccounts = localStorage.getItem("money-manager-accounts")
    const savedGoals = localStorage.getItem("money-manager-goals")
    if (savedAccounts) setAccounts(JSON.parse(savedAccounts))
    if (savedGoals) {
      const goals = JSON.parse(savedGoals)
      // Update account-tracked goals with current account balances
      const updatedGoals = goals.map((goal: SavingsGoal) => {
        if (goal.trackingMode === "account" && goal.trackedAccountId) {
          const account = JSON.parse(savedAccounts || "[]").find((acc: Account) => acc.id === goal.trackedAccountId)
          if (account) {
            return { ...goal, currentAmount: account.balance }
          }
        }
        return goal
      })
      setSavingsGoals(updatedGoals)
      if (JSON.stringify(goals) !== JSON.stringify(updatedGoals)) {
        localStorage.setItem("money-manager-goals", JSON.stringify(updatedGoals))
      }
    }
  }, [])

  const saveGoals = (updatedGoals: SavingsGoal[]) => {
    setSavingsGoals(updatedGoals)
    localStorage.setItem("money-manager-goals", JSON.stringify(updatedGoals))
  }

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline) return

    let currentAmount = 0
    if (newGoal.trackingMode === "account" && newGoal.trackedAccountId) {
      const account = accounts.find((acc) => acc.id === newGoal.trackedAccountId)
      currentAmount = account?.balance || 0
    }

    const goal: SavingsGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: Number.parseFloat(newGoal.targetAmount),
      currentAmount,
      deadline: newGoal.deadline,
      trackingMode: newGoal.trackingMode,
      trackedAccountId: newGoal.trackingMode === "account" ? newGoal.trackedAccountId : undefined,
    }

    saveGoals([...savingsGoals, goal])
    setNewGoal({
      name: "",
      targetAmount: "",
      deadline: "",
      trackingMode: "manual",
      trackedAccountId: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleEditGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingGoal || !newGoal.name || !newGoal.targetAmount || !newGoal.deadline) return

    let currentAmount = editingGoal.currentAmount
    if (newGoal.trackingMode === "account" && newGoal.trackedAccountId) {
      const account = accounts.find((acc) => acc.id === newGoal.trackedAccountId)
      currentAmount = account?.balance || 0
    }

    const updatedGoals = savingsGoals.map((goal) =>
      goal.id === editingGoal.id
        ? {
            ...goal,
            name: newGoal.name,
            targetAmount: Number.parseFloat(newGoal.targetAmount),
            currentAmount,
            deadline: newGoal.deadline,
            trackingMode: newGoal.trackingMode,
            trackedAccountId: newGoal.trackingMode === "account" ? newGoal.trackedAccountId : undefined,
          }
        : goal,
    )

    saveGoals(updatedGoals)
    setEditingGoal(null)
    setNewGoal({
      name: "",
      targetAmount: "",
      deadline: "",
      trackingMode: "manual",
      trackedAccountId: "",
    })
  }

  const handleDeleteGoal = (goalId: string) => {
    if (confirm("Are you sure you want to delete this savings goal?")) {
      const updatedGoals = savingsGoals.filter((goal) => goal.id !== goalId)
      saveGoals(updatedGoals)
    }
  }

  const handleAddContribution = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contributionDialogGoal || !contributionAmount) return

    const updatedGoals = savingsGoals.map((goal) =>
      goal.id === contributionDialogGoal.id
        ? { ...goal, currentAmount: goal.currentAmount + Number.parseFloat(contributionAmount) }
        : goal,
    )

    saveGoals(updatedGoals)
    setContributionDialogGoal(null)
    setContributionAmount("")
  }

  const openEditDialog = (goal: SavingsGoal) => {
    setEditingGoal(goal)
    setNewGoal({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      deadline: goal.deadline,
      trackingMode: goal.trackingMode,
      trackedAccountId: goal.trackedAccountId || "",
    })
  }

  const getGoalStatus = (goal: SavingsGoal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100
    const deadline = new Date(goal.deadline)
    const today = new Date()
    const isOverdue = deadline < today && progress < 100

    if (progress >= 100) return { status: "completed", color: "text-green-600" }
    if (isOverdue) return { status: "overdue", color: "text-red-600" }
    return { status: "in-progress", color: "text-blue-600" }
  }

  const getTrackedAccount = (goal: SavingsGoal) => {
    if (goal.trackingMode === "account" && goal.trackedAccountId) {
      return accounts.find((acc) => acc.id === goal.trackedAccountId)
    }
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center">
                <Wallet className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold">Money Manager</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/accounts">
                  <Button variant="ghost">Accounts</Button>
                </Link>
                <Link href="/transactions">
                  <Button variant="ghost">Transactions</Button>
                </Link>
                <Link href="/categories">
                  <Button variant="ghost">Categories</Button>
                </Link>
                <Link href="/goals">
                  <Button variant="ghost" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    Goals
                  </Button>
                </Link>
                <Link href="/import-export">
                  <Button variant="ghost">Import/Export</Button>
                </Link>
              </div>
              <div className="md:hidden">
                <Select defaultValue="goals">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accounts">
                      <Link href="/accounts">Accounts</Link>
                    </SelectItem>
                    <SelectItem value="transactions">
                      <Link href="/transactions">Transactions</Link>
                    </SelectItem>
                    <SelectItem value="categories">
                      <Link href="/categories">Categories</Link>
                    </SelectItem>
                    <SelectItem value="goals">Goals</SelectItem>
                    <SelectItem value="import-export">
                      <Link href="/import-export">Import/Export</Link>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Savings Goals</h1>
            <p className="text-muted-foreground">Track your progress towards financial goals</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Savings Goal</DialogTitle>
                <DialogDescription>Create a new goal to track your savings progress.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddGoal}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                      className="col-span-3"
                      placeholder="Goal name"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="targetAmount" className="text-right">
                      Target Amount
                    </Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      step="0.01"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                      className="col-span-3"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="deadline" className="text-right">
                      Deadline
                    </Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="trackingMode" className="text-right">
                      Tracking Mode
                    </Label>
                    <Select
                      value={newGoal.trackingMode}
                      onValueChange={(value: "manual" | "account") =>
                        setNewGoal({ ...newGoal, trackingMode: value, trackedAccountId: "" })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Updates</SelectItem>
                        <SelectItem value="account">Track Account Balance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newGoal.trackingMode === "account" && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="trackedAccount" className="text-right">
                        Account
                      </Label>
                      <Select
                        value={newGoal.trackedAccountId}
                        onValueChange={(value) => setNewGoal({ ...newGoal, trackedAccountId: value })}
                        required
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select account to track" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name} (${account.balance.toFixed(2)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {newGoal.trackingMode === "manual" && (
                    <div className="col-span-4 text-sm text-muted-foreground">
                      You can manually add contributions to track your progress.
                    </div>
                  )}
                  {newGoal.trackingMode === "account" && (
                    <div className="col-span-4 text-sm text-muted-foreground">
                      The goal will automatically track the selected account's balance.
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit">Add Goal</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savingsGoals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100
            const { status, color } = getGoalStatus(goal)
            const trackedAccount = getTrackedAccount(goal)

            return (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {goal.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              goal.trackingMode === "manual"
                                ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            }`}
                          >
                            {goal.trackingMode === "manual" ? "Manual" : "Auto-tracked"}
                          </span>
                          {trackedAccount && (
                            <span className="text-xs text-muted-foreground">→ {trackedAccount.name}</span>
                          )}
                        </div>
                        <div className="mt-2">
                          Target: ${goal.targetAmount.toFixed(2)} by {new Date(goal.deadline).toLocaleDateString()}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(goal)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteGoal(goal.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className={`text-sm font-medium ${color}`}>{Math.min(progress, 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${
                            progress >= 100 ? "bg-green-500" : "bg-blue-600"
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold">${goal.currentAmount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          ${(goal.targetAmount - goal.currentAmount).toFixed(2)} remaining
                        </p>
                      </div>
                      {goal.trackingMode === "manual" && (
                        <Button variant="outline" size="sm" onClick={() => setContributionDialogGoal(goal)}>
                          <DollarSign className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {status === "completed" && "🎉 Goal completed!"}
                      {status === "overdue" && "⚠️ Past deadline"}
                      {status === "in-progress" &&
                        `${Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining`}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {savingsGoals.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No savings goals yet</h3>
            <p className="text-muted-foreground mb-4">Set your first savings goal to start tracking your progress.</p>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Goal
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        )}

        {/* Edit Goal Dialog */}
        <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Savings Goal</DialogTitle>
              <DialogDescription>Update your savings goal information.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditGoal}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-targetAmount" className="text-right">
                    Target Amount
                  </Label>
                  <Input
                    id="edit-targetAmount"
                    type="number"
                    step="0.01"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-deadline" className="text-right">
                    Deadline
                  </Label>
                  <Input
                    id="edit-deadline"
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-trackingMode" className="text-right">
                    Tracking Mode
                  </Label>
                  <Select
                    value={newGoal.trackingMode}
                    onValueChange={(value: "manual" | "account") =>
                      setNewGoal({ ...newGoal, trackingMode: value, trackedAccountId: "" })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Updates</SelectItem>
                      <SelectItem value="account">Track Account Balance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newGoal.trackingMode === "account" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-trackedAccount" className="text-right">
                      Account
                    </Label>
                    <Select
                      value={newGoal.trackedAccountId}
                      onValueChange={(value) => setNewGoal({ ...newGoal, trackedAccountId: value })}
                      required
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select account to track" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} (${account.balance.toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">Update Goal</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Contribution Dialog */}
        <Dialog open={!!contributionDialogGoal} onOpenChange={() => setContributionDialogGoal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Contribution</DialogTitle>
              <DialogDescription>Add money to your "{contributionDialogGoal?.name}" savings goal.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddContribution}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contribution" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="contribution"
                    type="number"
                    step="0.01"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="col-span-3"
                    placeholder="0.00"
                    required
                  />
                </div>
                {contributionDialogGoal && (
                  <div className="col-span-4 text-sm text-muted-foreground">
                    Current progress: ${contributionDialogGoal.currentAmount.toFixed(2)} / $
                    {contributionDialogGoal.targetAmount.toFixed(2)}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">Add Contribution</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
