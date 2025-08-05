"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Target, Calendar, DollarSign } from "lucide-react"

export default function GoalsPage() {
  const goals = [
    {
      id: 1,
      name: "Emergency Fund",
      description: "Build an emergency fund for unexpected expenses",
      targetAmount: 10000,
      currentAmount: 7500,
      targetDate: "2024-12-31",
      category: "Safety Net",
      priority: "High",
    },
    {
      id: 2,
      name: "Vacation to Europe",
      description: "Save for a 2-week trip to Europe",
      targetAmount: 5000,
      currentAmount: 2800,
      targetDate: "2024-08-15",
      category: "Travel",
      priority: "Medium",
    },
    {
      id: 3,
      name: "New Car Down Payment",
      description: "Save for a down payment on a new car",
      targetAmount: 8000,
      currentAmount: 3200,
      targetDate: "2024-10-01",
      category: "Transportation",
      priority: "Medium",
    },
    {
      id: 4,
      name: "Home Renovation",
      description: "Kitchen and bathroom renovation project",
      targetAmount: 15000,
      currentAmount: 5500,
      targetDate: "2025-03-01",
      category: "Home",
      priority: "Low",
    },
  ]

  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const overallProgress = (totalCurrentAmount / totalTargetAmount) * 100

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Savings Goals</h1>
          <p className="text-muted-foreground">Track your progress towards financial goals</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
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
      <div className="grid gap-6 md:grid-cols-2">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100
          const remaining = goal.targetAmount - goal.currentAmount

          return (
            <Card key={goal.id} className="goal-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                    <CardDescription>{goal.description}</CardDescription>
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
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Add Money
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Edit Goal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Goal Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Insights</CardTitle>
          <CardDescription>Tips and recommendations for achieving your goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Monthly Savings Needed</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                To reach all your goals on time, you need to save approximately $
                {Math.round((totalTargetAmount - totalCurrentAmount) / 12).toLocaleString()} per month.
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
              <h3 className="font-medium text-green-900 dark:text-green-100">On Track Goals</h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                {goals.filter((goal) => goal.currentAmount / goal.targetAmount > 0.5).length} of your goals are more
                than 50% complete. Great progress!
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950">
              <h3 className="font-medium text-yellow-900 dark:text-yellow-100">Needs Attention</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Consider increasing contributions to goals with upcoming deadlines to stay on track.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
