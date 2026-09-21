import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { User, Phone, Mail, MapPin, Calendar, Edit, LogOut } from "lucide-react";
import React from "react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  // Mock data for the profile
  const profileData = {
    name: user || "Mugul",
    gender: "Male",
    phone: "8190901415",
    email: "mugul@example.com",
    dob: "12 Oct 1995",
    address: "Chennai, Tamil Nadu, India",
    memberSince: "January 2023",
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Not Logged In</h2>
        <p className="text-slate-500 mb-8">Please log in to view your profile.</p>
        <Button onClick={() => navigate({ to: "/login" })}>Log In</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full" />
          
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
            <span className="text-4xl font-bold">{profileData.name.charAt(0)}</span>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-900">{profileData.name}</h1>
            <p className="text-slate-500 mt-1 flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4" /> {profileData.email}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full border border-teal-100">
                Gold Member
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                Joined {profileData.memberSince}
              </span>
            </div>
          </div>

          <Button variant="outline" className="rounded-full shadow-sm">
            <Edit className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        </div>

        {/* Profile Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Full Name</p>
                <p className="text-base text-slate-900 font-medium">{profileData.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Gender</p>
                <p className="text-base text-slate-900 font-medium">{profileData.gender}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Date of Birth</p>
                <p className="text-base text-slate-900 font-medium">{profileData.dob}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" /> Contact Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Mobile Number</p>
                <p className="text-base text-slate-900 font-medium">{profileData.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Email Address</p>
                <p className="text-base text-slate-900 font-medium">{profileData.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Address</p>
                <p className="text-base text-slate-900 font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" /> {profileData.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="flex justify-center mt-8">
          <Button variant="destructive" onClick={handleLogout} className="rounded-full px-8 shadow-sm">
            <LogOut className="w-4 h-4 mr-2" /> Log Out
          </Button>
        </div>

      </div>
    </div>
  );
}
