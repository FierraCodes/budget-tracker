"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, DollarSign, TrendingUp, TrendingDown, Target } from "lucide-react"
import { QuickTransactionDialog } from "@/components/quick-transaction-dialog"
import { RecentTransactions } from "@/components/recent-transactions"
import { useState } from "react"

export default function Dashboard() {
  const [showQuickTransaction, setShowQuickTransaction] = useState(false)

  // Mock data
  const totalBalance = 12450.75
  const monthlyIncome = 5200.0
  const monthlyExpenses = 3150.25
  const savingsGoal = 10000
  const currentSavings = 7500

  const expenseData = [
    { name: "Food", value: 800, color: "#8884d8" },
    { name: "Transport", value: 400, color: "#82ca9d" },
    { name: "Entertainment", value: 300, color: "#ffc658" },
    { name: "Utilities", value: 250, color: "#ff7300" },
    { name: "Other", value: 400, color: "#00ff00" },
  ]

  const incomeVsExpenseData = [
    { month: "Jan", income: 5200, expenses: 3100 },
    { month: "Feb", income: 5200, expenses: 3300 },
    { month: "Mar", income: 5400, expenses: 3150 },
    { month: "Apr", income: 5200, expenses: 2900 },
    { month: "May", income: 5200, expenses: 3400 },
    { month: "Jun", income: 5200, expenses: 3150 },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
        </div>
        <Button onClick={() => setShowQuickTransaction(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Quick Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${monthlyIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+1.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${monthlyExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">-5.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentSavings.toLocaleString()}</div>
            <div className="mt-2">
              <div className="progress-bar">
                <div
                  className="progress-fill savings-progress"
                  style={{ width: `${(currentSavings / savingsGoal) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((currentSavings / savingsGoal) * 100)}% of ${savingsGoal.toLocaleString()} goal
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Your spending by category this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="chart-container flex items-center justify-center">
              <div className="space-y-2">
                {expenseData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between w-64">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">${item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Monthly comparison over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              <div className="space-y-4">
                {incomeVsExpenseData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.month}</span>
                      <span>
                        Income: ${item.income} | Expenses: ${item.expenses}
                      </span>
                    </div>
                    <div className="flex gap-1 h-6">
                      <div className="bg-green-500 rounded-sm" style={{ width: `${(item.income / 6000) * 100}%` }} />
                      <div className="bg-red-500 rounded-sm" style={{ width: `${(item.expenses / 6000) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <RecentTransactions />

      {/* Quick Transaction Dialog */}
      <QuickTransactionDialog open={showQuickTransaction} onOpenChange={setShowQuickTransaction} />
    </div>
  )
}
