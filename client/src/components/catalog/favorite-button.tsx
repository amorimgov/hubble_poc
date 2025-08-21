import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  productId: number;
  userEmail?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function FavoriteButton({ 
  productId, 
  userEmail = "user@example.com", // Default user for demo
  variant = "ghost",
  size = "icon",
  className 
}: FavoriteButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if product is favorited
  const { data: favoriteStatus = { isFavorited: false }, isLoading } = useQuery({
    queryKey: ['/api/favorites', userEmail, productId, 'check'],
    queryFn: async () => {
      const response = await fetch(`/api/favorites/${userEmail}/${productId}/check`);
      return response.json();
    },
    enabled: !!userEmail && !!productId,
  });

  const isFavorited = favoriteStatus.isFavorited;

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail, productId })
      });
      if (!response.ok) {
        throw new Error('Failed to add to favorites');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites', userEmail, productId, 'check'] });
      toast({
        title: "Favoritado!",
        description: "Produto adicionado aos seus favoritos.",
      });
    },
    onError: (error) => {
      console.error('Error adding to favorites:', error);
      toast({
        title: "Erro",
        description: "Não foi possível favoritar o produto.",
        variant: "destructive",
      });
    },
  });

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/favorites/${userEmail}/${productId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites', userEmail, productId, 'check'] });
      toast({
        title: "Removido dos favoritos",
        description: "Produto removido dos seus favoritos.",
      });
    },
    onError: (error) => {
      console.error('Error removing from favorites:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o produto dos favoritos.",
        variant: "destructive",
      });
    },
  });

  const handleToggleFavorite = () => {
    if (isFavorited) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
  };

  const isSubmitting = addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      disabled={isLoading || isSubmitting}
      className={cn(className)}
      title={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart 
        className={cn(
          "h-4 w-4",
          isFavorited && "fill-red-500 text-red-500",
          !isFavorited && "text-gray-400 hover:text-red-500"
        )} 
      />
      {size === "default" && (
        <span className="ml-1">
          {isFavorited ? "Favoritado" : "Favoritar"}
        </span>
      )}
    </Button>
  );
}