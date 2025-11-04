import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface ReportDialogProps {
  postId: string;
  linkId?: string;
}

const ReportDialog = ({ postId, linkId }: ReportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast.error("Please provide a comment");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("reports").insert({
        post_id: postId,
        link_id: linkId,
        comment: comment.trim(),
        reporter_email: email.trim() || null,
      });

      if (error) throw error;

      toast.success("Report submitted successfully");
      setComment("");
      setEmail("");
      setOpen(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/50 transition-all"
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Report Broken Link
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Report Broken Link</DialogTitle>
          <DialogDescription className="text-gray-400">
            Let us know if you found a broken or incorrect link
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-gray-200">Comment *</Label>
            <Textarea
              id="comment"
              placeholder="Describe the issue with the link..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-200">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
