import type { Member } from "../../types/community";
import { Avatar } from "../ui/Avatar";

type Props = {
  members: Member[];
  extra: string;
};

export function MemberCluster({ members, extra }: Props) {
  return (
    <div className="member-cluster">
      {members.map((member) => (
        <Avatar key={member.id} src={member.avatar} name={member.name} online={member.online} size="sm" />
      ))}
      <span className="member-extra">{extra}</span>
    </div>
  );
}
