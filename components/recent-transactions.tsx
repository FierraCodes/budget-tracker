"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react"

export function RecentTransactions() {
  const transactions = [
    {
      id: 1,
      type: "expense",
      amount: 85.5,
      category: "Food",
      description: "Grocery shopping",
      date: "2024-01-15",
      account: "Checking",
    },
    {
      id: 2,
      type: "income",
      amount: 2600.0,
      category: "Salary",
      description: "Monthly salary",
      date: "2024-01-15",
      account: "Checking",
    },
    {
      id: 3,
      type: "expense",
      amount: 45.0,
      category: "Transport",
      description: "Gas station",
      date: "2024-01-14",
      account: "Credit Card",
    },
    {
      id: 4,
      type: "expense",
      amount: 120.0,
      category: "Utilities",
      description: "Electricity bill",
      date: "2024-01-13",
      account: "Checking",
    },
    {
      id: 5,
      type: "income",
      amount: 500.0,
      category: "Freelance",
      description: "Web design project",
      date: "2024-01-12",
      account: "Savings",
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activities</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <div className="flex items-center space-x-4">
                <div
                  className={`p-2 rounded-full ${
                    transaction.type === "income" ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
                  }`}
                >
                  {transaction.type === "income" ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.category} • {transaction.account}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className={`text-sm font-semibold transaction-amount ${transaction.type}`}>
                    {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">{transaction.date}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
