"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft, Clock } from "lucide-react"

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

interface RecentTransactionsProps {
  transactions: Transaction[]
  accounts: Account[]
  limit?: number
  showHeader?: boolean
  showViewAll?: boolean
  className?: string
}

export function RecentTransactions({
  transactions,
  accounts,
  limit = 5,
  showHeader = true,
  showViewAll = true,
  className = "",
}: RecentTransactionsProps) {
  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    return account ? account.name : "Unknown Account"
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "income":
        return <ArrowDownRight className="h-4 w-4 text-green-600" />
      case "expense":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />
      case "transfer":
        return <ArrowRightLeft className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "bg-green-100 text-green-800"
      case "expense":
        return "bg-red-100 text-red-800"
      case "transfer":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatAmount = (amount: number, type: string) => {
    const prefix = type === "expense" ? "-" : ""
    return `${prefix}$${amount.toFixed(2)}`
  }

  const getAmountColor = (type: string) => {
    switch (type) {
      case "income":
        return "text-green-600"
      case "expense":
        return "text-red-600"
      case "transfer":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
            <CardDescription>Your latest financial activity</CardDescription>
          </div>
          {showViewAll && (
            <Link href="/transactions">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          )}
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">{getTransactionIcon(transaction.type)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{transaction.description || transaction.category}</p>
                    <Badge className={`${getTypeColor(transaction.type)} text-xs`}>{transaction.type}</Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span className="truncate">{getAccountName(transaction.accountId)}</span>
                    <span>•</span>
                    <span className="truncate">{transaction.category}</span>
                    {transaction.subcategory && (
                      <>
                        <span>•</span>
                        <span className="truncate">{transaction.subcategory}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className={`font-semibold ${getAmountColor(transaction.type)}`}>
                  {formatAmount(transaction.amount, transaction.type)}
                </p>
                <p className="text-sm text-muted-foreground">{formatRelativeDate(transaction.date)}</p>
              </div>
            </div>
          ))}
          {recentTransactions.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No transactions yet</p>
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
  )
}
