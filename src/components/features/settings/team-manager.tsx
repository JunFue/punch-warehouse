"use client";

import { useState } from "react";
import { changeUserRole, transferOwnership } from "@/actions/company";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ShieldAlert, User, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function TeamManager({ 
  members, 
  currentUserId,
  isOwner 
}: { 
  members: any[];
  currentUserId: string;
  isOwner: boolean;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, targetRole: string) => {
    setLoading(userId);
    const res = await changeUserRole(userId, targetRole);
    setLoading(null);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(`Role updated successfully`);
    }
  };

  const handleTransfer = async (userId: string) => {
    if (!confirm("Are you sure you want to transfer ownership? You will be demoted to an Admin immediately.")) return;
    
    setLoading(userId);
    const res = await transferOwnership(userId);
    setLoading(null);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Ownership transferred completely.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Directory</CardTitle>
        <CardDescription>
          View all members with access to your corporate data. Owners can manage roles and transfer ownership.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map(member => (
              <TableRow key={member.id} className={member.id === currentUserId ? "bg-muted/30" : ""}>
                <TableCell className="font-medium">
                  {member.full_name} {member.id === currentUserId && "(You)"}
                </TableCell>
                <TableCell className="text-muted-foreground">{member.email || "Confidential"}</TableCell>
                <TableCell>
                  <Badge variant={member.role === 'owner' ? 'default' : member.role === 'admin' ? 'secondary' : 'outline'}>
                    {member.role.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {isOwner && member.id !== currentUserId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 hover:bg-muted rounded-md touch-none" disabled={loading === member.id}>
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Manage User</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'admin')} className="cursor-pointer">
                          <ShieldCheck className="mr-2 h-4 w-4 text-primary" /> Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'member')} className="cursor-pointer">
                          <User className="mr-2 h-4 w-4 text-muted-foreground" /> Make Member
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleTransfer(member.id)} className="text-warning focus:text-warning cursor-pointer">
                          <ShieldAlert className="mr-2 h-4 w-4" /> Transfer Ownership
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
