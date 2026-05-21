import { useEffect, useState } from "react";
import { loadMembers } from "../../lib/communityApi";
import type { DetailMember } from "../../data/chatData";

export function MembersOnlinePanel() {
  const [members, setMembers] = useState<DetailMember[]>([]);

  useEffect(() => {
    let alive = true;
    loadMembers().then((result) => {
      if (alive) setMembers(result.online);
    });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="members-online-panel">
      <h2>Online agora</h2>
      {members.map((member) => (
        <article key={member.id}>
          <Avatar member={member} />
          <span>{member.name}</span>
        </article>
      ))}
    </section>
  );
}

function Avatar({ member }: { member: DetailMember }) {
  if (member.avatar.startsWith("/") || member.avatar.startsWith("http")) return <img src={member.avatar} alt="" />;
  return <span>{member.avatar.slice(0, 2)}</span>;
}
