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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, TrendingUp, TrendingDown, Edit, Trash2 } from "lucide-react"

interface Category {
  id: string
  name: string
  type: "income" | "expense"
  budget: number
  color: string
}

interface Transaction {
  id: string
  accountId: string
  type: "income" | "expense" | "transfer"
  amount: number
  category: string
  subcategory: string
  description: string
  date: string
}

const defaultColors = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00ff00",
  "#0088fe",
  "#00c49f",
  "#ffbb28",
  "#ff8042",
  "#8dd1e1",
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    budget: "",
    color: defaultColors[0],
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCategories = localStorage.getItem("money-manager-categories")
        const savedTransactions = localStorage.getItem("money-manager-transactions")

        if (savedCategories) {
          setCategories(JSON.parse(savedCategories))
        }
        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions))
        }
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.budget || typeof window === "undefined") return

    try {
      const category: Category = {
        id: editingCategory ? editingCategory.id : Date.now().toString(),
        name: formData.name,
        type: formData.type,
        budget: Number.parseFloat(formData.budget),
        color: formData.color,
      }

      let updatedCategories: Category[]
      if (editingCategory) {
        updatedCategories = categories.map((c) => (c.id === category.id ? category : c))
      } else {
        updatedCategories = [...categories, category]
      }

      setCategories(updatedCategories)
      localStorage.setItem("money-manager-categories", JSON.stringify(updatedCategories))

      // Reset form
      setFormData({
        name: "",
        type: "expense",
        budget: "",
        color: defaultColors[0],
      })
      setShowAddDialog(false)
      setEditingCategory(null)
    } catch (error) {
      console.error("Error saving category:", error)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      budget: category.budget.toString(),
      color: category.color,
    })
    setShowAddDialog(true)
  }

  const handleDelete = (categoryId: string) => {
    if (typeof window === "undefined") return

    try {
      const updatedCategories = categories.filter((c) => c.id !== categoryId)
      setCategories(updatedCategories)
      localStorage.setItem("money-manager-categories", JSON.stringify(updatedCategories))
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const getCategorySpending = (categoryName: string, type: "income" | "expense") => {
    if (!categoryName || !Array.isArray(transactions)) return 0

    return transactions
      .filter((t) => t && t.category && t.category.toLowerCase() === categoryName.toLowerCase() && t.type === type)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  }

  const expenseCategories = categories.filter((cat) => cat.type === "expense")
  const incomeCategories = categories.filter((cat) => cat.type === "income")

  const totalSpent = expenseCategories.reduce((sum, cat) => {
    if (!cat || !cat.name) return sum
    return sum + getCategorySpending(cat.name, "expense")
  }, 0)

  const totalBudget = expenseCategories.reduce((sum, cat) => {
    if (!cat || typeof cat.budget !== "number") return sum
    return sum + cat.budget
  }, 0)

  const totalEarned = incomeCategories.reduce((sum, cat) => {
    if (!cat || !cat.name) return sum
    return sum + getCategorySpending(cat.name, "income")
  }, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Organize and track your spending by category</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
              <DialogDescription>
                {editingCategory ? "Update the category details." : "Create a new category with budget tracking."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-field">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Food, Transportation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "income" | "expense") => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="form-field">
                <Label htmlFor="budget">
                  {formData.type === "expense" ? "Monthly Budget" : "Expected Monthly Amount"}
                </Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? "border-foreground" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false)
                    setEditingCategory(null)
                    setFormData({
                      name: "",
                      type: "expense",
                      budget: "",
                      color: defaultColors[0],
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingCategory ? "Update" : "Add"} Category</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              ${(totalSpent || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">of ${(totalBudget || 0).toLocaleString()} budgeted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Budget Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${Math.max(0, (totalBudget || 0) - (totalSpent || 0)).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalBudget > 0 ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 0}% remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${(totalEarned || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across {incomeCategories.length} income sources</p>
          </CardContent>
        </Card>
      </div>

      {/* Expense Categories */}
      {expenseCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Expense Categories
            </CardTitle>
            <CardDescription>Track your spending across different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {expenseCategories.map((category) => {
                if (!category || !category.name) return null

                const spent = getCategorySpending(category.name, "expense")
                const budget = Number(category.budget) || 0
                const percentage = budget > 0 ? (spent / budget) * 100 : 0
                const isOverBudget = spent > budget

                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color || "#8884d8" }}
                        />
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {
                              transactions.filter(
                                (t) => t && t.category && t.category.toLowerCase() === category.name.toLowerCase(),
                              ).length
                            }{" "}
                            transactions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className={`font-semibold ${isOverBudget ? "text-red-600 dark:text-red-400" : ""}`}>
                            ${(spent || 0).toFixed(2)} / ${(budget || 0).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">{(percentage || 0).toFixed(1)}% used</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${
                          isOverBudget ? "bg-red-500" : percentage > 80 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(percentage || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Income Categories */}
      {incomeCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Income Categories
            </CardTitle>
            <CardDescription>Track your income from different sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {incomeCategories.map((category) => {
                if (!category || !category.name) return null

                const earned = getCategorySpending(category.name, "income")
                const expected = Number(category.budget) || 0
                const percentage = expected > 0 ? (earned / expected) * 100 : 0

                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color || "#8884d8" }}
                        />
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {
                              transactions.filter(
                                (t) => t && t.category && t.category.toLowerCase() === category.name.toLowerCase(),
                              ).length
                            }{" "}
                            transactions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            ${(earned || 0).toFixed(2)} / ${(expected || 0).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">{(percentage || 0).toFixed(1)}% of expected</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill bg-green-500"
                        style={{ width: `${Math.min(percentage || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {categories.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No categories yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first category to start organizing your transactions and tracking budgets.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Category
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
