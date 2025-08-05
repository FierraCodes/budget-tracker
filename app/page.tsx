"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, DollarSign, TrendingUp, TrendingDown, Target } from "lucide-react"
import { QuickTransactionDialog } from "@/components/quick-transaction-dialog"
import { RecentTransactions } from "@/components/recent-transactions"

interface Account {
  id: string
  name: string
  balance: number
  type: "checking" | "savings" | "credit" | "investment"
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

interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
}

export default function Dashboard() {
  const [showQuickTransaction, setShowQuickTransaction] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      try {
        const savedAccounts = localStorage.getItem("money-manager-accounts")
        const savedTransactions = localStorage.getItem("money-manager-transactions")
        const savedGoals = localStorage.getItem("money-manager-goals")

        if (savedAccounts) {
          setAccounts(JSON.parse(savedAccounts))
        }
        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions))
        }
        if (savedGoals) {
          setSavingsGoals(JSON.parse(savedGoals))
        }
      } catch (error) {
        console.error("Error loading data from localStorage:", error)
      }
      setIsLoaded(true)
    }
  }, [])

  // Show loading state while data is being loaded
  if (!isLoaded) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Loading your financial overview...</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="skeleton h-4 w-20 mb-2"></div>
                <div className="skeleton h-8 w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
  const monthlyIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const monthlyExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const totalSavingsTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalCurrentSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)

  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const expenseData = Object.entries(expensesByCategory).map(([name, value], index) => ({
    name,
    value,
    color: ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00"][index % 5],
  }))

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
            <p className="text-xs text-muted-foreground">Across {accounts.length} accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${monthlyIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${monthlyExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Progress</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCurrentSavings.toLocaleString()}</div>
            {totalSavingsTarget > 0 && (
              <div className="mt-2">
                <div className="progress-bar">
                  <div
                    className="progress-fill savings-progress"
                    style={{ width: `${Math.min((totalCurrentSavings / totalSavingsTarget) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((totalCurrentSavings / totalSavingsTarget) * 100)}% of $
                  {totalSavingsTarget.toLocaleString()} goal
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Your spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="chart-container flex items-center justify-center">
              {expenseData.length > 0 ? (
                <div className="flex items-center gap-8">
                  {/* Pie Chart */}
                  <div className="relative">
                    <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                      {(() => {
                        const total = expenseData.reduce((sum, item) => sum + item.value, 0)
                        let cumulativePercentage = 0

                        return expenseData.map((item, index) => {
                          const percentage = (item.value / total) * 100
                          const strokeDasharray = `${percentage} ${100 - percentage}`
                          const strokeDashoffset = -cumulativePercentage

                          const slice = (
                            <circle
                              key={index}
                              cx="100"
                              cy="100"
                              r="80"
                              fill="transparent"
                              stroke={item.color}
                              strokeWidth="40"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              className="transition-all duration-300 hover:stroke-width-[45]"
                              style={{
                                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                              }}
                            />
                          )

                          cumulativePercentage += percentage
                          return slice
                        })
                      })()}

                      {/* Center circle for donut effect */}
                      <circle
                        cx="100"
                        cy="100"
                        r="40"
                        fill="hsl(var(--background))"
                        stroke="hsl(var(--border))"
                        strokeWidth="2"
                      />

                      {/* Center text */}
                      <text
                        x="100"
                        y="95"
                        textAnchor="middle"
                        className="fill-foreground text-sm font-medium transform rotate-90"
                        style={{ transformOrigin: "100px 100px" }}
                      >
                        Total
                      </text>
                      <text
                        x="100"
                        y="110"
                        textAnchor="middle"
                        className="fill-foreground text-lg font-bold transform rotate-90"
                        style={{ transformOrigin: "100px 100px" }}
                      >
                        ${expenseData.reduce((sum, item) => sum + item.value, 0).toFixed(0)}
                      </text>
                    </svg>
                  </div>

                  {/* Legend */}
                  <div className="space-y-3">
                    {expenseData.map((item, index) => {
                      const total = expenseData.reduce((sum, item) => sum + item.value, 0)
                      const percentage = ((item.value / total) * 100).toFixed(1)

                      return (
                        <div key={index} className="flex items-center gap-3 group cursor-pointer">
                          <div
                            className="w-4 h-4 rounded-full transition-transform group-hover:scale-110"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{item.name}</span>
                              <span className="text-sm text-muted-foreground"> | {percentage}%</span>
                            </div>
                            <div className="text-xs text-muted-foreground">${item.value.toFixed(2)}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <div className="w-32 h-32 rounded-full border-4 border-dashed border-muted mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p>No expense data available</p>
                  <p className="text-sm">Add some transactions to see your spending breakdown</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map((transaction) => {
                      const account = accounts.find((a) => a.id === transaction.accountId)
                      return (
                        <div key={transaction.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                transaction.type === "income"
                                  ? "bg-green-500"
                                  : transaction.type === "expense"
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                              }`}
                            />
                            <div>
                              <p className="text-sm font-medium">{transaction.description || transaction.category}</p>
                              <p className="text-xs text-muted-foreground">{account?.name || "Unknown Account"}</p>
                            </div>
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              transaction.type === "income"
                                ? "text-green-600"
                                : transaction.type === "expense"
                                  ? "text-red-600"
                                  : "text-blue-600"
                            }`}
                          >
                            {transaction.type === "expense" ? "-" : ""}${transaction.amount.toFixed(2)}
                          </span>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>No transactions yet</p>
                  <p className="text-sm">Add your first transaction to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <RecentTransactions transactions={transactions} accounts={accounts} />

      {/* Quick Transaction Dialog */}
      <QuickTransactionDialog
        open={showQuickTransaction}
        onOpenChange={setShowQuickTransaction}
        onTransactionAdded={() => {
          // Refresh data after transaction is added
          if (typeof window !== "undefined") {
            try {
              const savedTransactions = localStorage.getItem("money-manager-transactions")
              const savedAccounts = localStorage.getItem("money-manager-accounts")
              if (savedTransactions) setTransactions(JSON.parse(savedTransactions))
              if (savedAccounts) setAccounts(JSON.parse(savedAccounts))
            } catch (error) {
              console.error("Error refreshing data:", error)
            }
          }
        }}
      />
    </div>
  )
}
