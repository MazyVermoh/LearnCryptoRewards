import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface BotInfo {
  ok: boolean;
  result: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
    supports_inline_queries: boolean;
  };
}

export default function TelegramBotPreview() {
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [testChatId, setTestChatId] = useState("");
  const [testMessage, setTestMessage] = useState("Hello from bot preview!");
  const [webhookUrl, setWebhookUrl] = useState("");
  const { toast } = useToast();

  const fetchBotInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch("/telegram/info");
      if (response.ok) {
        const data = await response.json();
        setBotInfo(data);
      } else {
        throw new Error("Failed to fetch bot info");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bot information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/telegram/set-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Webhook set successfully",
        });
      } else {
        throw new Error("Failed to set webhook");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set webhook",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async () => {
    setLoading(true);
    try {
      const testUpdate = {
        update_id: Date.now(),
        message: {
          message_id: 1,
          from: {
            id: parseInt(testChatId) || 12345,
            is_bot: false,
            first_name: "Test",
            username: "testuser",
          },
          chat: {
            id: parseInt(testChatId) || 12345,
            first_name: "Test",
            type: "private",
          },
          date: Math.floor(Date.now() / 1000),
          text: "/start",
        },
      };

      const response = await fetch("/telegram/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUpdate),
      });

      if (response.ok) {
        toast({
          title: "Test Sent",
          description: "Webhook test completed. Check server logs for details.",
        });
      } else {
        toast({
          title: "Test Result",
          description: "Webhook processed but may have encountered chat limitations",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test webhook",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBotInfo();
    // Set default webhook URL based on current location
    const currentDomain = window.location.origin;
    setWebhookUrl(`${currentDomain}/telegram/webhook`);
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Telegram Bot Preview</h1>
        <p className="text-muted-foreground">
          Test and configure your MIND Token Educational Platform bot
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Bot Information */}
        <Card>
          <CardHeader>
            <CardTitle>Bot Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {botInfo && botInfo.result ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Bot Name</Badge>
                  <span>{botInfo.result.first_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Username</Badge>
                  <span>@{botInfo.result.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Bot ID</Badge>
                  <span>{botInfo.result.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Status</Badge>
                  <Badge variant="default" className="bg-green-500">
                    Active
                  </Badge>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() => window.open(`https://t.me/${botInfo.result.username}`, '_blank')}
                    className="w-full"
                  >
                    Open Bot in Telegram
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Loading bot information...</p>
                <Button onClick={fetchBotInfo} disabled={loading}>
                  {loading ? "Loading..." : "Retry"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Webhook Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-domain.replit.app/telegram/webhook"
              />
            </div>
            <Button onClick={setWebhook} disabled={loading} className="w-full">
              {loading ? "Setting..." : "Set Webhook"}
            </Button>
          </CardContent>
        </Card>

        {/* Test Commands */}
        <Card>
          <CardHeader>
            <CardTitle>Available Commands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <code className="font-mono">/start</code>
                <p className="text-sm text-muted-foreground mt-1">
                  Welcome message with 100 MIND token bonus
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <code className="font-mono">/profile</code>
                <p className="text-sm text-muted-foreground mt-1">
                  View user stats, tokens, and referral code
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <code className="font-mono">/help</code>
                <p className="text-sm text-muted-foreground mt-1">
                  Show available commands and features
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Webhook Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Test Webhook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-chat-id">Test Chat ID (Optional)</Label>
              <Input
                id="test-chat-id"
                value={testChatId}
                onChange={(e) => setTestChatId(e.target.value)}
                placeholder="Leave empty for default test ID"
                type="number"
              />
            </div>
            <Button onClick={testWebhook} disabled={loading} className="w-full">
              {loading ? "Testing..." : "Test /start Command"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Note: This will simulate a /start command. Real testing requires opening the bot in Telegram.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Test Your Bot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Open Bot in Telegram</h4>
              <p className="text-sm text-muted-foreground">
                Click "Open Bot in Telegram" above or search for @{botInfo?.result?.username || "Mind_Coin_Bot"} in Telegram
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Start Conversation</h4>
              <p className="text-sm text-muted-foreground">
                Send /start to receive welcome message and 100 MIND tokens
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">3. Test Web App</h4>
              <p className="text-sm text-muted-foreground">
                Click the "🎓 Open Educational Platform" button to test web app integration
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">4. For Production</h4>
              <p className="text-sm text-muted-foreground">
                After deployment, set the webhook URL to your production domain
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}