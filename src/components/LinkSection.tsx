import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Shield, Search } from "lucide-react";
import { toast } from "sonner";
import PostCard from "@/components/PostCard";

interface Post {
  id: string;
  title: string;
  slug: string;
  created_at: string;
}

const LinkSection = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 p-4">
        <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
            type="search"
            placeholder="Search links..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        {loading ? (
            <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-card rounded-lg animate-pulse" />
                ))}
            </div>
        ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16">
                <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-6">
                {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
                ))}
            </div>
        )}
    </div>
  );
};

export default LinkSection;
