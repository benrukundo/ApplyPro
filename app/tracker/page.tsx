"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, getCurrentUser, logout, User } from "@/lib/auth";
import {
  getAllApplications,
  addApplication,
  updateApplication,
  deleteApplication,
  Application,
  ApplicationStatus,
  Priority,
} from "@/lib/tracker";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  LogOut,
  Menu,
  X,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Calendar,
  ExternalLink,
  Edit,
  Trash2,
  Save,
  MapPin,
  DollarSign,
  User as UserIcon,
  Mail,
  StickyNote,
  AlertCircle,
  Loader2,
} from "lucide-react";

function TrackerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    positionTitle: "",
    status: "saved" as ApplicationStatus,
    appliedDate: "",
    salary: "",
    location: "",
    isRemote: false,
    jobUrl: "",
    notes: "",
    resumeVersion: "",
    followUpDate: "",
    priority: "medium" as Priority,
    contactPerson: "",
    contactEmail: "",
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drag and drop state
  const [draggedApp, setDraggedApp] = useState<Application | null>(null);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const currentUser = getCurrentUser();
    setUser(currentUser);

    // Load applications
    loadApplications();

    // Check for URL params
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    if (action === "add") {
      setShowAddModal(true);
    }

    if (id) {
      const app = applications.find((a) => a.id === id);
      if (app) {
        setSelectedApp(app);
        setShowDetailsModal(true);
      }
    }
  }, [router, searchParams]);

  const loadApplications = () => {
    const apps = getAllApplications();
    setApplications(apps);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const resetForm = () => {
    setFormData({
      companyName: "",
      positionTitle: "",
      status: "saved",
      appliedDate: "",
      salary: "",
      location: "",
      isRemote: false,
      jobUrl: "",
      notes: "",
      resumeVersion: "",
      followUpDate: "",
      priority: "medium",
      contactPerson: "",
      contactEmail: "",
    });
    setFormError("");
    setIsEditMode(false);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (app: Application) => {
    setFormData({
      companyName: app.companyName,
      positionTitle: app.positionTitle,
      status: app.status,
      appliedDate: app.appliedDate
        ? new Date(app.appliedDate).toISOString().split("T")[0]
        : "",
      salary: app.salary,
      location: app.location,
      isRemote: app.isRemote,
      jobUrl: app.jobUrl,
      notes: app.notes,
      resumeVersion: app.resumeVersion,
      followUpDate: app.followUpDate
        ? new Date(app.followUpDate).toISOString().split("T")[0]
        : "",
      priority: app.priority,
      contactPerson: app.contactPerson,
      contactEmail: app.contactEmail,
    });
    setSelectedApp(app);
    setIsEditMode(true);
    setShowAddModal(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!formData.companyName.trim()) {
      setFormError("Company name is required");
      return;
    }

    if (!formData.positionTitle.trim()) {
      setFormError("Position title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const appData = {
        companyName: formData.companyName.trim(),
        positionTitle: formData.positionTitle.trim(),
        status: formData.status,
        appliedDate: formData.appliedDate
          ? new Date(formData.appliedDate).getTime()
          : null,
        salary: formData.salary.trim(),
        location: formData.location.trim(),
        isRemote: formData.isRemote,
        jobUrl: formData.jobUrl.trim(),
        notes: formData.notes.trim(),
        resumeVersion: formData.resumeVersion.trim(),
        followUpDate: formData.followUpDate
          ? new Date(formData.followUpDate).getTime()
          : null,
        priority: formData.priority,
        contactPerson: formData.contactPerson.trim(),
        contactEmail: formData.contactEmail.trim(),
      };

      if (isEditMode && selectedApp) {
        // Update existing application
        const result = updateApplication(selectedApp.id, appData);
        if (!result.success) {
          setFormError(result.error || "Failed to update application");
          setIsSubmitting(false);
          return;
        }
      } else {
        // Add new application
        const result = addApplication(appData);
        if (!result.success) {
          setFormError(result.error || "Failed to add application");
          setIsSubmitting(false);
          return;
        }
      }

      // Success
      loadApplications();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setFormError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteApplication = () => {
    if (!selectedApp) return;

    const result = deleteApplication(selectedApp.id);
    if (result.success) {
      loadApplications();
      setShowDeleteModal(false);
      setShowDetailsModal(false);
      setSelectedApp(null);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (app: Application) => {
    setDraggedApp(app);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: ApplicationStatus) => {
    if (!draggedApp) return;

    if (draggedApp.status !== status) {
      updateApplication(draggedApp.id, { status });
      loadApplications();
    }

    setDraggedApp(null);
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "saved":
        return "bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-700";
      case "applied":
        return "bg-blue-50 border-blue-300 dark:bg-blue-950/20 dark:border-blue-800";
      case "interview":
        return "bg-purple-50 border-purple-300 dark:bg-purple-950/20 dark:border-purple-800";
      case "offer":
        return "bg-green-50 border-green-300 dark:bg-green-950/20 dark:border-green-800";
      case "rejected":
        return "bg-red-50 border-red-300 dark:bg-red-950/20 dark:border-red-800";
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case "saved":
        return <Save className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
      case "applied":
        return <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case "interview":
        return <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case "offer":
        return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        app.companyName.toLowerCase().includes(query) ||
        app.positionTitle.toLowerCase().includes(query) ||
        app.location.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Group by status for board view
  const applicationsByStatus = {
    saved: filteredApplications.filter((app) => app.status === "saved"),
    applied: filteredApplications.filter((app) => app.status === "applied"),
    interview: filteredApplications.filter((app) => app.status === "interview"),
    offer: filteredApplications.filter((app) => app.status === "offer"),
    rejected: filteredApplications.filter((app) => app.status === "rejected"),
  };

  const statusColumns: { status: ApplicationStatus; title: string; icon: string }[] = [
    { status: "saved", title: "Saved", icon: "📝" },
    { status: "applied", title: "Applied", icon: "📤" },
    { status: "interview", title: "Interview", icon: "📞" },
    { status: "offer", title: "Offer", icon: "🎉" },
    { status: "rejected", title: "Rejected", icon: "❌" },
  ];

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="inline-block h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Application Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredApplications.length} applications
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-700">
              <button
                onClick={() => setViewMode("board")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === "board"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Board
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                <List className="h-4 w-4" />
                List
              </button>
            </div>

            {/* Add Button */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              Add
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applications..."
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* Board View */}
        {viewMode === "board" && (
          <div className="grid gap-4 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2">
            {statusColumns.map((column) => (
              <div
                key={column.status}
                className="flex flex-col"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.status)}
              >
                {/* Column Header */}
                <div className="mb-3 rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{column.icon}</span>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {column.title}
                      </h3>
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {applicationsByStatus[column.status].length}
                    </span>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1">
                  {applicationsByStatus[column.status].length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        No applications
                      </p>
                    </div>
                  ) : (
                    applicationsByStatus[column.status].map((app) => (
                      <div
                        key={app.id}
                        draggable
                        onDragStart={() => handleDragStart(app)}
                        onClick={() => {
                          setSelectedApp(app);
                          setShowDetailsModal(true);
                        }}
                        className={`cursor-move rounded-lg border-2 p-4 transition-all hover:shadow-md ${getStatusColor(
                          app.status
                        )} ${draggedApp?.id === app.id ? "opacity-50" : ""}`}
                      >
                        {/* Company & Position */}
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {app.companyName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {app.positionTitle}
                        </p>

                        {/* Meta Info */}
                        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                          {app.appliedDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(app.appliedDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          {app.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{app.location}</span>
                              {app.isRemote && (
                                <span className="ml-1 text-green-600 dark:text-green-400">
                                  (Remote)
                                </span>
                              )}
                            </div>
                          )}

                          {/* Priority Badge */}
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(
                                app.priority
                              )}`}
                            >
                              {app.priority}
                            </span>

                            {/* Days ago */}
                            <span className="text-gray-500 dark:text-gray-500">
                              {Math.floor(
                                (Date.now() - app.updatedAt) / (1000 * 60 * 60 * 24)
                              )}{" "}
                              days ago
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            {filteredApplications.length === 0 ? (
              <div className="py-12 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No applications found
                </p>
                <button
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Application
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Company / Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Applied Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Location
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredApplications.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {app.companyName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {app.positionTitle}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(app.status)}
                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                              {app.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityColor(
                              app.priority
                            )}`}
                          >
                            {app.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {app.appliedDate
                            ? new Date(app.appliedDate).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {app.location || "—"}
                          {app.isRemote && (
                            <span className="ml-1 text-green-600 dark:text-green-400">
                              (Remote)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setShowDetailsModal(true);
                            }}
                            className="text-blue-600 hover:underline dark:text-blue-400 mr-3"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(app)}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-3"
                          >
                            <Edit className="inline h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            <Trash2 className="inline h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      {/* Add/Edit Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white dark:bg-gray-900">
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditMode ? "Edit Application" : "Add Application"}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitApplication} className="p-6 space-y-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Google, Apple, etc."
                  disabled={isSubmitting}
                />
              </div>

              {/* Position Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Position Title *
                </label>
                <input
                  type="text"
                  value={formData.positionTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, positionTitle: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Senior Software Engineer"
                  disabled={isSubmitting}
                />
              </div>

              {/* Two Column Layout */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as ApplicationStatus,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    disabled={isSubmitting}
                  >
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as Priority,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    disabled={isSubmitting}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Applied Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Applied Date
                  </label>
                  <input
                    type="date"
                    value={formData.appliedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, appliedDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Follow-up Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) =>
                      setFormData({ ...formData, followUpDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Location and Salary */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="San Francisco, CA"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) =>
                      setFormData({ ...formData, salary: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="$100k - $150k"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Remote Checkbox */}
              <div className="flex items-center">
                <input
                  id="remote"
                  type="checkbox"
                  checked={formData.isRemote}
                  onChange={(e) =>
                    setFormData({ ...formData, isRemote: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="remote"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Remote position
                </label>
              </div>

              {/* Job URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Description URL
                </label>
                <input
                  type="url"
                  value={formData.jobUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, jobUrl: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="https://..."
                  disabled={isSubmitting}
                />
              </div>

              {/* Contact Info */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPerson: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Jane Doe"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="jane@company.com"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Resume Version */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resume Version Used
                </label>
                <input
                  type="text"
                  value={formData.resumeVersion}
                  onChange={(e) =>
                    setFormData({ ...formData, resumeVersion: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Modern Template v1"
                  disabled={isSubmitting}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Additional notes about this application..."
                  disabled={isSubmitting}
                />
              </div>

              {/* Error Message */}
              {formError && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {formError}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {isEditMode ? "Update Application" : "Save Application"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal - Coming next */}
      {showDetailsModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white dark:bg-gray-900">
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Application Details
                </h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedApp(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Company and Position */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedApp.companyName}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {selectedApp.positionTitle}
                </p>
              </div>

              {/* Status and Priority */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedApp.status)}
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {selectedApp.status}
                  </span>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${getPriorityColor(
                    selectedApp.priority
                  )}`}
                >
                  {selectedApp.priority} priority
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {selectedApp.appliedDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Applied Date
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(selectedApp.appliedDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {selectedApp.followUpDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Follow-up Date
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(selectedApp.followUpDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {selectedApp.location && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Location
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedApp.location}
                      {selectedApp.isRemote && (
                        <span className="ml-2 text-green-600 dark:text-green-400">
                          (Remote)
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {selectedApp.salary && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Salary Range
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedApp.salary}
                    </p>
                  </div>
                )}

                {selectedApp.contactPerson && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Contact Person
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedApp.contactPerson}
                    </p>
                  </div>
                )}

                {selectedApp.contactEmail && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Contact Email
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedApp.contactEmail}
                    </p>
                  </div>
                )}

                {selectedApp.resumeVersion && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Resume Version
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedApp.resumeVersion}
                    </p>
                  </div>
                )}
              </div>

              {/* Job URL */}
              {selectedApp.jobUrl && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Job Posting
                  </p>
                  <a
                    href={selectedApp.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline dark:text-blue-400"
                  >
                    View Job Posting
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              {/* Notes */}
              {selectedApp.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Notes
                  </p>
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedApp.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  Application Timeline
                </p>
                <div className="space-y-3">
                  {selectedApp.history.map((entry, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                          {getStatusIcon(entry.status)}
                        </div>
                        {index < selectedApp.history.length - 1 && (
                          <div className="h-full w-0.5 bg-gray-200 dark:bg-gray-700 my-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {entry.status}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {entry.note}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {new Date(entry.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowDeleteModal(true);
                  }}
                  className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-6 py-3 font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="h-5 w-5" />
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleOpenEditModal(selectedApp);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  <Edit className="h-5 w-5" />
                  Edit Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Application
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete the application for{" "}
              <strong>{selectedApp.positionTitle}</strong> at{" "}
              <strong>{selectedApp.companyName}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteApplication}
                className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
              >
                Delete Application
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}


export default function TrackerPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tracker...</p>
        </div>
      </div>
    }>
      <TrackerContent />
    </Suspense>
  );
}
