"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown, Target, Wallet } from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import Link from "next/link"
import { QuickTransactionDialog } from "@/components/quick-transaction-dialog"
import { ThemeToggle } from "@/components/theme-toggle"

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
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    // Load data from localStorage
    const savedAccounts = localStorage.getItem("money-manager-accounts")
    const savedTransactions = localStorage.getItem("money-manager-transactions")
    const savedGoals = localStorage.getItem("money-manager-goals")

    if (savedAccounts) setAccounts(JSON.parse(savedAccounts))
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions))
    if (savedGoals) setSavingsGoals(JSON.parse(savedGoals))
  }, [refreshKey])

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  // Prepare chart data
  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const pieData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
  }))

  const monthlyData = transactions.reduce(
    (acc, t) => {
      const month = new Date(t.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      if (!acc[month]) acc[month] = { month, income: 0, expenses: 0 }
      if (t.type === "income") acc[month].income += t.amount
      if (t.type === "expense") acc[month].expenses += t.amount
      return acc
    },
    {} as Record<string, any>,
  )

  const chartData = Object.values(monthlyData).slice(-6)

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold">Money Manager</span>
            </div>
            <div className="flex items-center space-x-4">
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
                <Button variant="ghost">Goals</Button>
              </Link>
              <Link href="/import-export">
                <Button variant="ghost">Import/Export</Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Quick Actions Bar */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <div className="flex gap-3">
              <QuickTransactionDialog type="income" onTransactionAdded={() => setRefreshKey((prev) => prev + 1)}>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Income
                </Button>
              </QuickTransactionDialog>
              <QuickTransactionDialog type="expense" onTransactionAdded={() => setRefreshKey((prev) => prev + 1)}>
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </QuickTransactionDialog>
              <QuickTransactionDialog type="transfer" onTransactionAdded={() => setRefreshKey((prev) => prev + 1)}>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transfer
                </Button>
              </QuickTransactionDialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your financial status</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Across all accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                ${(totalIncome - totalExpenses).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Income - Expenses</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <CardDescription>Breakdown of your spending</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, "Amount"]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>Monthly comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]} />
                  <Bar dataKey="income" fill="#10B981" name="Income" />
                  <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activity</CardDescription>
              </div>
              <Link href="/transactions">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((transaction) => {
                    const account = accounts.find((a) => a.id === transaction.accountId)
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              transaction.type === "income"
                                ? "bg-green-500"
                                : transaction.type === "expense"
                                  ? "bg-red-500"
                                  : "bg-blue-500"
                            }`}
                          />
                          <div>
                            <p className="font-medium">{transaction.description || transaction.category}</p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span>{account?.name || "Unknown Account"}</span>
                              <span>•</span>
                              <span>{transaction.category}</span>
                              {transaction.subcategory && (
                                <>
                                  <span>•</span>
                                  <span>{transaction.subcategory}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-medium ${
                              transaction.type === "income"
                                ? "text-green-600"
                                : transaction.type === "expense"
                                  ? "text-red-600"
                                  : "text-blue-600"
                            }`}
                          >
                            {transaction.type === "expense" ? "-" : ""}${transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                {transactions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No transactions yet</p>
                    <p className="text-sm text-muted-foreground">
                      <Link href="/transactions" className="text-blue-600 hover:underline">
                        Add your first transaction
                      </Link>{" "}
                      to get started
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Accounts and Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Accounts</CardTitle>
                <CardDescription>Your financial accounts</CardDescription>
              </div>
              <Link href="/accounts">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.slice(0, 3).map((account) => (
                  <div key={account.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{account.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${account.balance.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                {accounts.length === 0 && <p className="text-muted-foreground text-center py-4">No accounts yet</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Savings Goals</CardTitle>
                <CardDescription>Track your progress</CardDescription>
              </div>
              <Link href="/goals">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savingsGoals.slice(0, 3).map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{goal.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
                {savingsGoals.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No savings goals yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
