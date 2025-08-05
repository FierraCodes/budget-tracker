"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, DollarSign, TrendingUp, TrendingDown, Target, RotateCcw } from "lucide-react"
import { QuickTransactionDialog } from "@/components/quick-transaction-dialog"
import { RecentTransactions } from "@/components/recent-transactions"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable"
import { DraggableCard } from "@/components/draggable-card"

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

interface DashboardWidget {
  id: string
  type: "balance" | "income" | "expenses" | "savings"
  title: string
  order: number
}

const defaultWidgets: DashboardWidget[] = [
  { id: "balance", type: "balance", title: "Total Balance", order: 0 },
  { id: "income", type: "income", title: "Total Income", order: 1 },
  { id: "expenses", type: "expenses", title: "Total Expenses", order: 2 },
  { id: "savings", type: "savings", title: "Savings Progress", order: 3 },
]

export default function Dashboard() {
  const [showQuickTransaction, setShowQuickTransaction] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [widgets, setWidgets] = useState<DashboardWidget[]>(defaultWidgets)
  const [isLoaded, setIsLoaded] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    // Initialize with sample data if no data exists
    if (typeof window !== "undefined") {
      try {
        const savedAccounts = localStorage.getItem("money-manager-accounts")
        const savedTransactions = localStorage.getItem("money-manager-transactions")
        const savedGoals = localStorage.getItem("money-manager-goals")
        const savedWidgets = localStorage.getItem("money-manager-widgets")

        if (savedAccounts) {
          const parsedAccounts = JSON.parse(savedAccounts)
          setAccounts(Array.isArray(parsedAccounts) ? parsedAccounts : [])
        } else {
          // Initialize with sample accounts
          const sampleAccounts: Account[] = [
            { id: "1", name: "Main Checking", balance: 2500.75, type: "checking" },
            { id: "2", name: "Savings Account", balance: 8500.0, type: "savings" },
            { id: "3", name: "Credit Card", balance: -1250.3, type: "credit" },
          ]
          setAccounts(sampleAccounts)
          localStorage.setItem("money-manager-accounts", JSON.stringify(sampleAccounts))
        }

        if (savedTransactions) {
          const parsedTransactions = JSON.parse(savedTransactions)
          setTransactions(Array.isArray(parsedTransactions) ? parsedTransactions : [])
        } else {
          // Initialize with sample transactions
          const sampleTransactions: Transaction[] = [
            {
              id: "1",
              accountId: "1",
              type: "expense",
              amount: 85.5,
              category: "Food",
              subcategory: "Groceries",
              description: "Weekly grocery shopping",
              date: "2024-01-15",
            },
            {
              id: "2",
              accountId: "1",
              type: "income",
              amount: 2600.0,
              category: "Salary",
              subcategory: "Regular Pay",
              description: "Monthly salary",
              date: "2024-01-15",
            },
            {
              id: "3",
              accountId: "3",
              type: "expense",
              amount: 45.0,
              category: "Transportation",
              subcategory: "Gas",
              description: "Gas station",
              date: "2024-01-14",
            },
          ]
          setTransactions(sampleTransactions)
          localStorage.setItem("money-manager-transactions", JSON.stringify(sampleTransactions))
        }

        if (savedGoals) {
          const parsedGoals = JSON.parse(savedGoals)
          setSavingsGoals(Array.isArray(parsedGoals) ? parsedGoals : [])
        } else {
          // Initialize with sample goals
          const sampleGoals: SavingsGoal[] = [
            {
              id: "1",
              name: "Emergency Fund",
              targetAmount: 10000,
              currentAmount: 7500,
              deadline: "2024-12-31",
            },
          ]
          setSavingsGoals(sampleGoals)
          localStorage.setItem("money-manager-goals", JSON.stringify(sampleGoals))
        }

        if (savedWidgets) {
          const parsedWidgets = JSON.parse(savedWidgets)
          setWidgets(Array.isArray(parsedWidgets) ? parsedWidgets : defaultWidgets)
        } else {
          setWidgets(defaultWidgets)
          localStorage.setItem("money-manager-widgets", JSON.stringify(defaultWidgets))
        }
      } catch (error) {
        console.error("Error loading data from localStorage:", error)
        // Set default values if parsing fails
        setAccounts([])
        setTransactions([])
        setSavingsGoals([])
        setWidgets(defaultWidgets)
      }
      setIsLoaded(true)
    }
  }, [])

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const newOrder = arrayMove(items, oldIndex, newIndex)

        if (typeof window !== "undefined") {
          localStorage.setItem("money-manager-widgets", JSON.stringify(newOrder))
        }

        return newOrder
      })
    }
  }

  const resetLayout = () => {
    setWidgets(defaultWidgets)
    if (typeof window !== "undefined") {
      localStorage.setItem("money-manager-widgets", JSON.stringify(defaultWidgets))
    }
  }

  const refreshData = () => {
    if (typeof window !== "undefined") {
      try {
        const savedTransactions = localStorage.getItem("money-manager-transactions")
        const savedAccounts = localStorage.getItem("money-manager-accounts")
        const savedGoals = localStorage.getItem("money-manager-goals")

        if (savedTransactions) {
          const parsedTransactions = JSON.parse(savedTransactions)
          setTransactions(Array.isArray(parsedTransactions) ? parsedTransactions : [])
        }
        if (savedAccounts) {
          const parsedAccounts = JSON.parse(savedAccounts)
          setAccounts(Array.isArray(parsedAccounts) ? parsedAccounts : [])
        }
        if (savedGoals) {
          const parsedGoals = JSON.parse(savedGoals)
          setSavingsGoals(Array.isArray(parsedGoals) ? parsedGoals : [])
        }
      } catch (error) {
        console.error("Error refreshing data:", error)
      }
    }
  }

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

  const totalBalance = Array.isArray(accounts)
    ? accounts.reduce((sum, account) => sum + (Number(account?.balance) || 0), 0)
    : 0

  const monthlyIncome = Array.isArray(transactions)
    ? transactions.filter((t) => t && t.type === "income").reduce((sum, t) => sum + (Number(t?.amount) || 0), 0)
    : 0

  const monthlyExpenses = Array.isArray(transactions)
    ? transactions.filter((t) => t && t.type === "expense").reduce((sum, t) => sum + (Number(t?.amount) || 0), 0)
    : 0

  const totalSavingsTarget = Array.isArray(savingsGoals)
    ? savingsGoals.reduce((sum, goal) => sum + (Number(goal?.targetAmount) || 0), 0)
    : 0

  const totalCurrentSavings = Array.isArray(savingsGoals)
    ? savingsGoals.reduce((sum, goal) => sum + (Number(goal?.currentAmount) || 0), 0)
    : 0

  const expensesByCategory = Array.isArray(transactions)
    ? transactions
        .filter((t) => t && t.type === "expense" && t.category)
        .reduce(
          (acc, t) => {
            const category = String(t.category || "Other")
            acc[category] = (acc[category] || 0) + (Number(t.amount) || 0)
            return acc
          },
          {} as Record<string, number>,
        )
    : {}

  const expenseData = Object.entries(expensesByCategory).map(([name, value], index) => ({
    name,
    value,
    color: ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00"][index % 5],
  }))

  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case "balance":
        return (
          <DraggableCard key={widget.id} id={widget.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalBalance || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across {accounts.length} accounts</p>
            </CardContent>
          </DraggableCard>
        )
      case "income":
        return (
          <DraggableCard key={widget.id} id={widget.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${(monthlyIncome || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </DraggableCard>
        )
      case "expenses":
        return (
          <DraggableCard key={widget.id} id={widget.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${(monthlyExpenses || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </DraggableCard>
        )
      case "savings":
        return (
          <DraggableCard key={widget.id} id={widget.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Progress</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalCurrentSavings || 0).toLocaleString()}</div>
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
          </DraggableCard>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetLayout} className="flex items-center gap-2 bg-transparent">
            <RotateCcw className="h-4 w-4" />
            Reset Layout
          </Button>
          <Button onClick={() => setShowQuickTransaction(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Quick Transaction
          </Button>
        </div>
      </div>

      {/* Draggable Summary Cards */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {widgets.map((widget) => renderWidget(widget))}
          </div>
        </SortableContext>
      </DndContext>

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
                        const total = expenseData.reduce((sum, item) => sum + (Number(item.value) || 0), 0)
                        let cumulativePercentage = 0

                        return expenseData.map((item, index) => {
                          const percentage = total > 0 ? ((Number(item.value) || 0) / total) * 100 : 0
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
                        ${expenseData.reduce((sum, item) => sum + (Number(item.value) || 0), 0).toFixed(0)}
                      </text>
                    </svg>
                  </div>

                  {/* Legend */}
                  <div className="space-y-3">
                    {expenseData.map((item, index) => {
                      const total = expenseData.reduce((sum, item) => sum + (Number(item.value) || 0), 0)
                      const percentage = total > 0 ? (((Number(item.value) || 0) / total) * 100).toFixed(1) : "0.0"

                      return (
                        <div key={index} className="flex items-center gap-3 group cursor-pointer">
                          <div
                            className="w-4 h-4 rounded-full transition-transform group-hover:scale-110"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{String(item.name || "Unknown")}</span>
                              <span className="text-sm text-muted-foreground"> | {percentage}%</span>
                            </div>
                            <div className="text-xs text-muted-foreground">${(Number(item.value) || 0).toFixed(2)}</div>
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
              {Array.isArray(transactions) && transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions
                    .filter((transaction) => transaction && transaction.date)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map((transaction) => {
                      const account = Array.isArray(accounts)
                        ? accounts.find((a) => a && a.id === transaction.accountId)
                        : null
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
                              <p className="text-sm font-medium">
                                {String(transaction.description || transaction.category || "Unknown")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {String(account?.name || "Unknown Account")}
                              </p>
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
                            {transaction.type === "expense" ? "-" : ""}${(Number(transaction.amount) || 0).toFixed(2)}
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
      <RecentTransactions
        transactions={Array.isArray(transactions) ? transactions : []}
        accounts={Array.isArray(accounts) ? accounts : []}
      />

      {/* Quick Transaction Dialog */}
      <QuickTransactionDialog
        open={showQuickTransaction}
        onOpenChange={setShowQuickTransaction}
        onTransactionAdded={refreshData}
      />
    </div>
  )
}
