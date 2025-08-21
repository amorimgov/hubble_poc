import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface HeaderProps {
  onAddProduct: () => void;
}

export default function Header({ onAddProduct }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Hubble - Portfólio de Produtos de Dados</h1>
          <p className="text-gray-600 mt-1">Gerencie e descubra todos os produtos de dados da organização</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={onAddProduct} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>
    </header>
  );
}
