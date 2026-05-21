import { useEffect, useState } from "react";
import { posts } from "../../data/communityData";
import { loadPosts } from "../../lib/communityApi";
import type { Post } from "../../types/community";
import { FeedHeader } from "../feed/FeedHeader";
import { PostComposer } from "../feed/PostComposer";
import { PostCard } from "../post/PostCard";

export function SpaceFeedMain() {
  const [spacePosts, setSpacePosts] = useState<Post[]>(posts);

  useEffect(() => {
    let ignore = false;

    loadPosts()
      .then((nextPosts) => {
        if (!ignore && nextPosts.length > 0) setSpacePosts(nextPosts);
      })
      .catch(() => {
        if (!ignore) setSpacePosts(posts);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="space-main">
      <FeedHeader />
      <div className="space-feed-scroll">
        <div className="space-feed-column">
          <PostComposer />
          {spacePosts.map((post) => (
            <PostCard post={post} key={post.id} />
          ))}
        </div>
      </div>
    </main>
  );
}
