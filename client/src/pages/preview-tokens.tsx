import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PreviewToken, InsertPreviewToken } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPreviewTokenSchema } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function PreviewTokens() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: tokens, isLoading } = useQuery<PreviewToken[]>({
    queryKey: ["/api/tokens"],
  });

  const form = useForm<InsertPreviewToken>({
    resolver: zodResolver(insertPreviewTokenSchema),
    defaultValues: {
      token: "",
      description: "",
      expiresAt: undefined,
      isActive: 1,
    },
  });

  const createTokenMutation = useMutation({
    mutationFn: async (data: InsertPreviewToken) =>
      apiRequest("POST", "/api/tokens", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Token created",
        description: "Preview token has been generated successfully",
      });
    },
  });

  const copyToClipboard = async (token: string) => {
    await navigator.clipboard.writeText(token);
    setCopiedToken(token);
    toast({
      title: "Copied!",
      description: "Token copied to clipboard",
    });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading preview tokens...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Preview Tokens</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage secure access tokens for QA and testing
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-token">
              <Plus className="h-4 w-4 mr-2" />
              Generate Token
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Preview Token</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) =>
                  createTokenMutation.mutate(data)
                )}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Leave empty to auto-generate"
                          {...field}
                          data-testid="input-token"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What is this token for?"
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expires At (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          data-testid="input-expires"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createTokenMutation.isPending}
                  data-testid="button-submit-token"
                >
                  {createTokenMutation.isPending
                    ? "Generating..."
                    : "Generate Token"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tokens && tokens.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No preview tokens yet. Create one to get started.
            </CardContent>
          </Card>
        )}
        {tokens?.map((token) => (
          <Card key={token.id} className="hover-elevate">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-base">{token.description}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={token.isActive ? "default" : "secondary"}>
                      {token.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {token.expiresAt && (
                      <Badge variant="outline" className="text-xs">
                        Expires{" "}
                        {formatDistanceToNow(new Date(token.expiresAt), {
                          addSuffix: true,
                        })}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Token</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded-md text-xs font-mono break-all">
                    {token.token}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(token.token)}
                    data-testid={`button-copy-${token.id}`}
                  >
                    {copiedToken === token.token ? (
                      <Check className="h-4 w-4 text-chart-1" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-mono">
                    {formatDistanceToNow(new Date(token.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Usage Count</p>
                  <p className="font-mono">{token.usageCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
