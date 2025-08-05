"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, CreditCard, PiggyBank, Wallet } from "lucide-react"

export default function AccountsPage() {
  const accounts = [
    {
      id: 1,
      name: "Main Checking",
      type: "checking",
      balance: 5420.75,
      bank: "Chase Bank",
      accountNumber: "****1234",
      icon: Wallet,
    },
    {
      id: 2,
      name: "Savings Account",
      type: "savings",
      balance: 12500.0,
      bank: "Chase Bank",
      accountNumber: "****5678",
      icon: PiggyBank,
    },
    {
      id: 3,
      name: "Credit Card",
      type: "credit",
      balance: -1250.3,
      bank: "American Express",
      accountNumber: "****9012",
      icon: CreditCard,
    },
  ]

  const getBalanceColor = (balance: number, type: string) => {
    if (type === "credit") {
      return balance < 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
    }
    return balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage your bank accounts and credit cards</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Account Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${(5420.75 + 12500.0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              ${Math.abs(-1250.3).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(5420.75 + 12500.0 - 1250.3).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => {
          const IconComponent = account.icon
          return (
            <Card key={account.id} className="account-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <IconComponent className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{account.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{account.bank}</p>
                  <p className="text-sm text-muted-foreground">{account.accountNumber}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {account.type === "credit" ? "Balance Owed" : "Current Balance"}
                  </p>
                  <p className={`text-2xl font-bold ${getBalanceColor(account.balance, account.type)}`}>
                    ${Math.abs(account.balance).toLocaleString()}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Account Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Account Activity</CardTitle>
          <CardDescription>Latest transactions across all accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                account: "Main Checking",
                description: "Direct Deposit",
                amount: 2600.0,
                date: "2024-01-15",
                type: "credit",
              },
              {
                account: "Credit Card",
                description: "Amazon Purchase",
                amount: -89.99,
                date: "2024-01-14",
                type: "debit",
              },
              {
                account: "Savings Account",
                description: "Interest Payment",
                amount: 12.5,
                date: "2024-01-13",
                type: "credit",
              },
              {
                account: "Main Checking",
                description: "ATM Withdrawal",
                amount: -100.0,
                date: "2024-01-12",
                type: "debit",
              },
            ].map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.account} • {transaction.date}
                  </p>
                </div>
                <p
                  className={`font-semibold ${
                    transaction.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {transaction.amount >= 0 ? "+" : ""}${transaction.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
