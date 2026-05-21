import { posts } from "../../data/communityData";
import { PostCard } from "../post/PostCard";
import { FeedHeader } from "./FeedHeader";
import { PostComposer } from "./PostComposer";

export function Feed() {
  return (
    <main className="feed-area">
      <FeedHeader />
      <div className="feed-scroll">
        <div className="feed-column">
          <PostComposer />
          {posts.map((post) => (
            <PostCard post={post} key={post.id} />
          ))}
        </div>
      </div>
    </main>
  );
}
