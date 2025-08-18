import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Save,
  X,
  Folder,
  Hash
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  postCount: number;
  createdAt: string;
  isDefault: boolean;
}

const CategoryManager = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "seo",
      name: "SEO",
      description: "Search Engine Optimization gerelateerde content",
      color: "#10B981",
      postCount: 45,
      createdAt: "2024-01-01",
      isDefault: true
    },
    {
      id: "marketing",
      name: "Marketing",
      description: "Content marketing en advertentie strategieën",
      color: "#3B82F6",
      postCount: 32,
      createdAt: "2024-01-01",
      isDefault: true
    },
    {
      id: "business",
      name: "Business",
      description: "Zakelijke content en business strategieën",
      color: "#8B5CF6",
      postCount: 28,
      createdAt: "2024-01-01",
      isDefault: true
    },
    {
      id: "technology",
      name: "Technology",
      description: "Tech trends, tools en innovaties",
      color: "#F59E0B",
      postCount: 19,
      createdAt: "2024-01-01",
      isDefault: false
    },
    {
      id: "lokaal",
      name: "Lokaal",
      description: "Lokale SEO en regionale content",
      color: "#EF4444",
      postCount: 67,
      createdAt: "2024-01-10",
      isDefault: false
    }
  ]);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "#6B7280"
  });

  const predefinedColors = [
    "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", 
    "#EC4899", "#14B8A6", "#F97316", "#84CC16", "#6366F1"
  ];

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Naam vereist",
        description: "Voer een categorienaam in",
        variant: "destructive"
      });
      return;
    }

    const category: Category = {
      id: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
      name: newCategory.name,
      description: newCategory.description,
      color: newCategory.color,
      postCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      isDefault: false
    };

    setCategories(prev => [...prev, category]);
    setNewCategory({ name: "", description: "", color: "#6B7280" });
    setIsAddingCategory(false);

    toast({
      title: "Categorie Toegevoegd",
      description: `"${category.name}" is succesvol aangemaakt`
    });
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      color: category.color
    });
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;

    setCategories(prev => prev.map(cat => 
      cat.id === editingCategory.id 
        ? { ...cat, name: newCategory.name, description: newCategory.description, color: newCategory.color }
        : cat
    ));

    setEditingCategory(null);
    setNewCategory({ name: "", description: "", color: "#6B7280" });

    toast({
      title: "Categorie Bijgewerkt",
      description: "Wijzigingen zijn opgeslagen"
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    
    if (category?.isDefault) {
      toast({
        title: "Kan niet verwijderen",
        description: "Standaard categorieën kunnen niet worden verwijderd",
        variant: "destructive"
      });
      return;
    }

    if (category?.postCount > 0) {
      toast({
        title: "Categorie in gebruik",
        description: `Deze categorie heeft ${category.postCount} posts. Verplaats eerst alle posts.`,
        variant: "destructive"
      });
      return;
    }

    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    
    toast({
      title: "Categorie Verwijderd",
      description: `"${category?.name}" is verwijderd`
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Folder className="h-8 w-8 text-primary" />
            Categorie Beheer
          </h2>
          <p className="text-muted-foreground">
            Beheer je content categorieën en organiseer je posts
          </p>
        </div>

        <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary-glow">
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Categorie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nieuwe Categorie Toevoegen</DialogTitle>
              <DialogDescription>
                Maak een nieuwe categorie aan voor je content
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Naam</Label>
                <Input
                  id="category-name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Bijvoorbeeld: Lokale SEO"
                />
              </div>
              
              <div>
                <Label htmlFor="category-description">Beschrijving</Label>
                <Textarea
                  id="category-description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Korte beschrijving van deze categorie..."
                />
              </div>
              
              <div>
                <Label>Kleur</Label>
                <div className="flex gap-2 mt-2">
                  {predefinedColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        newCategory.color === color ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddCategory} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Opslaan
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingCategory(false)}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuleren
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map(category => (
          <Card key={category.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  {category.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      Standaard
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditCategory(category)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  {!category.isDefault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <CardDescription className="mb-3">
                {category.description || "Geen beschrijving beschikbaar"}
              </CardDescription>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  {category.postCount} posts
                </div>
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ 
                    borderColor: category.color,
                    color: category.color 
                  }}
                >
                  {category.createdAt}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Categorie Bewerken</DialogTitle>
            <DialogDescription>
              Wijzig de eigenschappen van "{editingCategory?.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-category-name">Naam</Label>
              <Input
                id="edit-category-name"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Categorie naam"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-category-description">Beschrijving</Label>
              <Textarea
                id="edit-category-description"
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beschrijving..."
              />
            </div>
            
            <div>
              <Label>Kleur</Label>
              <div className="flex gap-2 mt-2">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      newCategory.color === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdateCategory} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Opslaan
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingCategory(null)}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Annuleren
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManager;