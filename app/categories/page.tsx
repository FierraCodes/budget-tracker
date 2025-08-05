"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, ArrowLeft, Wallet, Tag } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

interface Category {
  id: string
  name: string
  type: "income" | "expense" | "transfer"
  subcategories: string[]
}

const defaultCategories: Category[] = [
  {
    id: "1",
    name: "Salary",
    type: "income",
    subcategories: ["Regular Pay", "Overtime", "Bonus"],
  },
  {
    id: "2",
    name: "Business",
    type: "income",
    subcategories: ["Sales", "Services", "Consulting"],
  },
  {
    id: "3",
    name: "Investment",
    type: "income",
    subcategories: ["Dividends", "Interest", "Capital Gains"],
  },
  {
    id: "4",
    name: "Food",
    type: "expense",
    subcategories: ["Groceries", "Restaurants", "Coffee"],
  },
  {
    id: "5",
    name: "Transportation",
    type: "expense",
    subcategories: ["Gas", "Public Transit", "Parking"],
  },
  {
    id: "6",
    name: "Housing",
    type: "expense",
    subcategories: ["Rent", "Utilities", "Maintenance"],
  },
  {
    id: "7",
    name: "Entertainment",
    type: "expense",
    subcategories: ["Movies", "Games", "Subscriptions"],
  },
  {
    id: "8",
    name: "Transfer",
    type: "transfer",
    subcategories: ["Between Accounts", "To Savings", "From Savings"],
  },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "expense" as "income" | "expense" | "transfer",
    subcategories: [] as string[],
  })
  const [newSubcategory, setNewSubcategory] = useState("")

  useEffect(() => {
    const savedCategories = localStorage.getItem("money-manager-categories")
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories))
    } else {
      localStorage.setItem("money-manager-categories", JSON.stringify(defaultCategories))
    }
  }, [])

  const saveCategories = (updatedCategories: Category[]) => {
    setCategories(updatedCategories)
    localStorage.setItem("money-manager-categories", JSON.stringify(updatedCategories))
  }

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.name) return

    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name,
      type: newCategory.type,
      subcategories: newCategory.subcategories,
    }

    saveCategories([...categories, category])
    setNewCategory({ name: "", type: "expense", subcategories: [] })
    setIsAddDialogOpen(false)
  }

  const handleEditCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory || !newCategory.name) return

    const updatedCategories = categories.map((category) =>
      category.id === editingCategory.id
        ? {
            ...category,
            name: newCategory.name,
            type: newCategory.type,
            subcategories: newCategory.subcategories,
          }
        : category,
    )

    saveCategories(updatedCategories)
    setEditingCategory(null)
    setNewCategory({ name: "", type: "expense", subcategories: [] })
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      const updatedCategories = categories.filter((category) => category.id !== categoryId)
      saveCategories(updatedCategories)
    }
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setNewCategory({
      name: category.name,
      type: category.type,
      subcategories: [...category.subcategories],
    })
  }

  const addSubcategory = () => {
    if (newSubcategory.trim() && !newCategory.subcategories.includes(newSubcategory.trim())) {
      setNewCategory({
        ...newCategory,
        subcategories: [...newCategory.subcategories, newSubcategory.trim()],
      })
      setNewSubcategory("")
    }
  }

  const removeSubcategory = (subcategory: string) => {
    setNewCategory({
      ...newCategory,
      subcategories: newCategory.subcategories.filter((sub) => sub !== subcategory),
    })
  }

  const getCategoryTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "expense":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "transfer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center">
                <Wallet className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold">Money Manager</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/accounts">
                  <Button variant="ghost">Accounts</Button>
                </Link>
                <Link href="/transactions">
                  <Button variant="ghost">Transactions</Button>
                </Link>
                <Link href="/categories">
                  <Button variant="ghost" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    Categories
                  </Button>
                </Link>
                <Link href="/goals">
                  <Button variant="ghost">Goals</Button>
                </Link>
                <Link href="/import-export">
                  <Button variant="ghost">Import/Export</Button>
                </Link>
              </div>
              <div className="md:hidden">
                <Select defaultValue="categories">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accounts">
                      <Link href="/accounts">Accounts</Link>
                    </SelectItem>
                    <SelectItem value="transactions">
                      <Link href="/transactions">Transactions</Link>
                    </SelectItem>
                    <SelectItem value="categories">Categories</SelectItem>
                    <SelectItem value="goals">
                      <Link href="/goals">Goals</Link>
                    </SelectItem>
                    <SelectItem value="import-export">
                      <Link href="/import-export">Import/Export</Link>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground">Organize your transactions with custom categories</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>Create a new category to organize your transactions.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCategory}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      className="col-span-3"
                      placeholder="Category name"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select
                      value={newCategory.type}
                      onValueChange={(value: "income" | "expense" | "transfer") =>
                        setNewCategory({ ...newCategory, type: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right mt-2">Subcategories</Label>
                    <div className="col-span-3 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newSubcategory}
                          onChange={(e) => setNewSubcategory(e.target.value)}
                          placeholder="Add subcategory"
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSubcategory())}
                        />
                        <Button type="button" onClick={addSubcategory} size="sm">
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {newCategory.subcategories.map((sub) => (
                          <div
                            key={sub}
                            className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                          >
                            {sub}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => removeSubcategory(sub)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Category</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      {category.name}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryTypeColor(category.type)}`}
                      >
                        {category.type}
                      </span>
                    </CardTitle>
                    <CardDescription>{category.subcategories.length} subcategories</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.subcategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.map((subcategory) => (
                        <span key={subcategory} className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-sm">
                          {subcategory}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No subcategories</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No categories yet</h3>
            <p className="text-muted-foreground mb-4">Create categories to organize your transactions.</p>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Category
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        )}

        {/* Edit Category Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Update your category information.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditCategory}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={newCategory.type}
                    onValueChange={(value: "income" | "expense" | "transfer") =>
                      setNewCategory({ ...newCategory, type: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">Subcategories</Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newSubcategory}
                        onChange={(e) => setNewSubcategory(e.target.value)}
                        placeholder="Add subcategory"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSubcategory())}
                      />
                      <Button type="button" onClick={addSubcategory} size="sm">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newCategory.subcategories.map((sub) => (
                        <div
                          key={sub}
                          className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                        >
                          {sub}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => removeSubcategory(sub)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Update Category</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
