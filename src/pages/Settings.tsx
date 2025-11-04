import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const formSchema = z.object({
  enableLinkShortener: z.boolean().default(false),
  linkShortenerService: z.enum(["gplinks", "bitly", "tinyurl", "isgd", "cuttly", "mdiskshortner"]),
});

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enableLinkShortener: false,
      linkShortenerService: "gplinks",
    },
  });

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (settings) {
        form.setValue("enableLinkShortener", settings.enable_link_shortener);
        form.setValue("linkShortenerService", settings.link_shortener_service as any);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          enable_link_shortener: values.enableLinkShortener,
          link_shortener_service: values.linkShortenerService,
        }, {
          onConflict: "user_id"
        });

      if (error) throw error;

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Update your account information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="enableLinkShortener"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Link Shortener</FormLabel>
                      <FormDescription>
                        {field.value 
                          ? "✓ Links will be automatically shortened when creating posts" 
                          : "Links will not be shortened and will use their original URLs"}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          toast.info(checked ? "Link shortener enabled" : "Link shortener disabled");
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="linkShortenerService"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Shortener Service</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gplinks">GPLinks</SelectItem>
                        <SelectItem value="bitly">Bitly</SelectItem>
                        <SelectItem value="tinyurl">TinyURL</SelectItem>
                        <SelectItem value="isgd">Is.gd</SelectItem>
                        <SelectItem value="cuttly">Cuttly</SelectItem>
                        <SelectItem value="mdiskshortner">MDisk Shortner</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose which service to use for shortening links
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
