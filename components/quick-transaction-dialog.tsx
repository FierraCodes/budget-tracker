"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

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

interface QuickTransactionDialogProps {
  type: "income" | "expense" | "transfer"
  children: React.ReactNode
  onTransactionAdded: () => void
}

const defaultCategories = {
  income: {
    Salary: ["Regular Pay", "Overtime", "Bonus"],
    Business: ["Sales", "Services", "Consulting"],
    Investment: ["Dividends", "Interest", "Capital Gains"],
    Other: ["Gifts", "Refunds", "Miscellaneous"],
  },
  expense: {
    Food: ["Groceries", "Restaurants", "Coffee"],
    Transportation: ["Gas", "Public Transit", "Parking"],
    Housing: ["Rent", "Utilities", "Maintenance"],
    Entertainment: ["Movies", "Games", "Subscriptions"],
    Healthcare: ["Doctor", "Pharmacy", "Insurance"],
    Shopping: ["Clothing", "Electronics", "Home"],
    Other: ["Fees", "Taxes", "Miscellaneous"],
  },
  transfer: {
    Transfer: ["Between Accounts", "To Savings", "From Savings"],
  },
}

export function QuickTransactionDialog({ type, children, onTransactionAdded }: QuickTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [accountId, setAccountId] = useState("")
  const [toAccountId, setToAccountId] = useState("")
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("")
  const [description, setDescription] = useState("")

  const accounts: Account[] = JSON.parse(localStorage.getItem("money-manager-accounts") || "[]")
  const categories = defaultCategories[type]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !accountId || !category) return

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      accountId,
      type,
      amount: Number.parseFloat(amount),
      category,
      subcategory,
      description,
      date: new Date().toISOString().split("T")[0],
    }

    // Get existing data
    const existingTransactions = JSON.parse(localStorage.getItem("money-manager-transactions") || "[]")
    const existingAccounts = JSON.parse(localStorage.getItem("money-manager-accounts") || "[]")

    // Add transaction
    const updatedTransactions = [...existingTransactions, newTransaction]
    localStorage.setItem("money-manager-transactions", JSON.stringify(updatedTransactions))

    // Update account balances
    const updatedAccounts = existingAccounts.map((account: Account) => {
      if (account.id === accountId) {
        if (type === "income") {
          return { ...account, balance: account.balance + Number.parseFloat(amount) }
        } else if (type === "expense") {
          return { ...account, balance: account.balance - Number.parseFloat(amount) }
        } else if (type === "transfer" && toAccountId) {
          return { ...account, balance: account.balance - Number.parseFloat(amount) }
        }
      }
      if (type === "transfer" && account.id === toAccountId) {
        return { ...account, balance: account.balance + Number.parseFloat(amount) }
      }
      return account
    })

    localStorage.setItem("money-manager-accounts", JSON.stringify(updatedAccounts))

    // Reset form
    setAmount("")
    setAccountId("")
    setToAccountId("")
    setCategory("")
    setSubcategory("")
    setDescription("")
    setOpen(false)

    onTransactionAdded()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add {type === "income" ? "Income" : type === "expense" ? "Expense" : "Transfer"}</DialogTitle>
          <DialogDescription>Quickly add a new {type} transaction to your account.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                placeholder="0.00"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account" className="text-right">
                {type === "transfer" ? "From" : "Account"}
              </Label>
              <Select value={accountId} onValueChange={setAccountId} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} (${account.balance.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type === "transfer" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="toAccount" className="text-right">
                  To
                </Label>
                <Select value={toAccountId} onValueChange={setToAccountId} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      .filter((account) => account.id !== accountId)
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} (${account.balance.toFixed(2)})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={category}
                onValueChange={(value) => {
                  setCategory(value)
                  setSubcategory("")
                }}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(categories).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {category && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subcategory" className="text-right">
                  Subcategory
                </Label>
                <Select value={subcategory} onValueChange={setSubcategory}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories[category as keyof typeof categories]?.map((subcat) => (
                      <SelectItem key={subcat} value={subcat}>
                        {subcat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Optional description"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              Add {type === "income" ? "Income" : type === "expense" ? "Expense" : "Transfer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
