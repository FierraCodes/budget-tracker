"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

interface Category {
  id: string
  name: string
  type: "income" | "expense"
  budget: number
  color: string
  subcategories?: string[]
}

interface QuickTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTransactionAdded?: () => void
}

export function QuickTransactionDialog({ open, onOpenChange, onTransactionAdded }: QuickTransactionDialogProps) {
  const [type, setType] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState("")
  const [accountId, setAccountId] = useState("")
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("")
  const [description, setDescription] = useState("")
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    if (open && typeof window !== "undefined") {
      try {
        const savedAccounts = localStorage.getItem("money-manager-accounts")
        const savedCategories = localStorage.getItem("money-manager-categories")
        
        if (savedAccounts) {
          const parsedAccounts = JSON.parse(savedAccounts)
          setAccounts(Array.isArray(parsedAccounts) ? parsedAccounts : [])
        }
        if (savedCategories) {
          const parsedCategories = JSON.parse(savedCategories)
          setCategories(Array.isArray(parsedCategories) ? parsedCategories : [])
        }
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !accountId || !category || typeof window === "undefined") return

    try {
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
          const balanceChange = type === "income" ? Number.parseFloat(amount) : -Number.parseFloat(amount)
          return { ...account, balance: account.balance + balanceChange }
        }
        return account
      })

      localStorage.setItem("money-manager-accounts", JSON.stringify(updatedAccounts))

      // Reset form
      setAmount("")
      setAccountId("")
      setCategory("")
      setSubcategory("")
      setDescription("")
      onOpenChange(false)

      // Notify parent component
      if (onTransactionAdded) {
        onTransactionAdded()
      }
    } catch (error) {
      console.error("Error saving transaction:", error)
    }
  }

  // Get categories for the selected type
  const availableCategories = Array.isArray(categories) 
    ? categories.filter(cat => cat.type === type)
    : []

  // Get subcategories for the selected category
  const selectedCategory = availableCategories.find(cat => cat.name === category)
  const availableSubcategories = selectedCategory?.subcategories || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quick Transaction</DialogTitle>
          <DialogDescription>Add a new income or expense transaction quickly.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-field">
            <Label htmlFor="type" className="form-label">
              Type
            </Label>
            <Select
              value={type}
              onValueChange={(value: "income" | "expense") => {
                setType(value)
                setCategory("")
                setSubcategory("")
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="form-field">
            <Label htmlFor="amount" className="form-label">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <Label htmlFor="account" className="form-label">
              Account
            </Label>
            <Select value={accountId} onValueChange={setAccountId} required>
              <SelectTrigger>
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

          <div className="form-field">
            <Label htmlFor="category" className="form-label">
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
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableCategories.length === 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                No categories available. <a href="/categories" className="text-blue-600 hover:underline">Create categories</a> first.
              </p>
            )}
          </div>

          {category && availableSubcategories.length > 0 && (
            <div className="form-field">
              <Label htmlFor="subcategory" className="form-label">
                Subcategory
              </Label>
              <Select value={subcategory} onValueChange={setSubcategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubcategories.map((subcat) => (
                    <SelectItem key={subcat} value={subcat}>
                      {subcat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="form-field">
            <Label htmlFor="description" className="form-label">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add a note about this transaction..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={availableCategories.length === 0}>
              Add Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
