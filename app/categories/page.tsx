"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown } from "lucide-react"

export default function CategoriesPage() {
  const categories = [
    {
      id: 1,
      name: "Food & Dining",
      type: "expense",
      spent: 850.5,
      budget: 1000.0,
      transactions: 15,
      color: "#8884d8",
    },
    {
      id: 2,
      name: "Transportation",
      type: "expense",
      spent: 420.0,
      budget: 500.0,
      transactions: 8,
      color: "#82ca9d",
    },
    {
      id: 3,
      name: "Entertainment",
      type: "expense",
      spent: 325.99,
      budget: 400.0,
      transactions: 12,
      color: "#ffc658",
    },
    {
      id: 4,
      name: "Utilities",
      type: "expense",
      spent: 280.0,
      budget: 300.0,
      transactions: 4,
      color: "#ff7300",
    },
    {
      id: 5,
      name: "Shopping",
      type: "expense",
      spent: 450.75,
      budget: 600.0,
      transactions: 9,
      color: "#00ff00",
    },
    {
      id: 6,
      name: "Salary",
      type: "income",
      earned: 5200.0,
      budget: 5200.0,
      transactions: 2,
      color: "#0088fe",
    },
    {
      id: 7,
      name: "Freelance",
      type: "income",
      earned: 1200.0,
      budget: 1000.0,
      transactions: 3,
      color: "#00c49f",
    },
  ]

  const expenseCategories = categories.filter((cat) => cat.type === "expense")
  const incomeCategories = categories.filter((cat) => cat.type === "income")

  const totalSpent = expenseCategories.reduce((sum, cat) => sum + cat.spent, 0)
  const totalBudget = expenseCategories.reduce((sum, cat) => sum + cat.budget, 0)
  const totalEarned = incomeCategories.reduce((sum, cat) => sum + (cat.earned || 0), 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Organize and track your spending by category</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">${totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">of ${totalBudget.toLocaleString()} budgeted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Budget Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${(totalBudget - totalSpent).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(((totalBudget - totalSpent) / totalBudget) * 100)}% remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">${totalEarned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across {incomeCategories.length} income sources</p>
          </CardContent>
        </Card>
      </div>

      {/* Expense Categories */}
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
              const percentage = (category.spent / category.budget) * 100
              const isOverBudget = category.spent > category.budget

              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.transactions} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${isOverBudget ? "text-red-600 dark:text-red-400" : ""}`}>
                        ${category.spent.toFixed(2)} / ${category.budget.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}% used</p>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${
                        isOverBudget ? "bg-red-500" : percentage > 80 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Income Categories */}
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
              const earned = category.earned || 0
              const expected = category.budget
              const percentage = (earned / expected) * 100

              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.transactions} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        ${earned.toFixed(2)} / ${expected.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}% of expected</p>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill bg-green-500" style={{ width: `${Math.min(percentage, 100)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
