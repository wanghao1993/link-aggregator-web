"use client";

import React from "react";
import { Users, Shield, Mail, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UsersAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage user accounts and permissions</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
            <Users className="text-muted-foreground" size={32} />
          </div>
          <h3 className="text-lg font-medium mb-2">User Management</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            This feature is coming soon. You will be able to view all users, manage roles, and handle user-related actions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
