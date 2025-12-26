"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  getAllApplications,
  addApplication,
  updateApplication,
  deleteApplication,
  setCurrentUserId,
  Application,
  ApplicationStatus,
  Priority,
  JobSource,
} from "@/lib/tracker";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
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
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  GripVertical,
  MoreHorizontal,
} from "lucide-react";

export const dynamic = 'force-dynamic';

const CARDS_PER_COLUMN = 5;

function TrackerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  // Expanded columns state
  const [expandedColumns, setExpandedColumns] = useState<Set<ApplicationStatus>>(new Set());

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
    jobSource: "other" as JobSource,
    followUpDate: "",
    priority: "medium" as Priority,
    contactPerson: "",
    contactEmail: "",
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drag and drop state
  const [draggedApp, setDraggedApp] = useState<Application | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ApplicationStatus | null>(null);

  // Hover state for cards
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/tracker');
    }
  }, [status, router]);

  // Load applications when authenticated
  useEffect(() => {
    const loadApplications = async () => {
      try {
        const apps = await getAllApplications();
        setApplications(apps);

        // Handle URL parameters after loading apps
        const action = searchParams.get('action');
        const id = searchParams.get('id');

        if (action === 'add') {
          setShowAddModal(true);
        }

        if (id) {
          const app = apps.find((a) => a.id === id);
          if (app) {
            setSelectedApp(app);
            setShowDetailsModal(true);
          }
        }
      } catch (error) {
        console.error('Error loading applications:', error);
      }
    };

    if (status === 'authenticated' && session?.user?.id) {
      loadApplications();
    }
  }, [status, session?.user?.id, searchParams]);

  const toggleColumnExpand = (status: ApplicationStatus) => {
    setExpandedColumns(prev => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
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
      jobSource: "other",
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
      salary: app.salary || "",
      location: app.location || "",
      isRemote: app.isRemote,
      jobUrl: app.jobUrl || "",
      notes: app.notes || "",
      jobSource: app.jobSource || "other",
      followUpDate: app.followUpDate
        ? new Date(app.followUpDate).toISOString().split("T")[0]
        : "",
      priority: app.priority,
      contactPerson: app.contactPerson || "",
      contactEmail: app.contactEmail || "",
    });
    setSelectedApp(app);
    setIsEditMode(true);
    setShowAddModal(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

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
          ? new Date(formData.appliedDate)
          : undefined,
        salary: formData.salary.trim(),
        location: formData.location.trim(),
        isRemote: formData.isRemote,
        jobUrl: formData.jobUrl.trim(),
        notes: formData.notes.trim(),
        jobSource: formData.jobSource,
        followUpDate: formData.followUpDate
          ? new Date(formData.followUpDate)
          : undefined,
        priority: formData.priority,
        contactPerson: formData.contactPerson.trim(),
        contactEmail: formData.contactEmail.trim(),
      };

      if (isEditMode && selectedApp) {
        const result = await updateApplication(selectedApp.id, appData);
        if (!result.success) {
          setFormError(result.error || "Failed to update application");
          setIsSubmitting(false);
          return;
        }
      } else {
        const result = await addApplication(appData);
        if (!result.success) {
          setFormError(result.error || "Failed to add application");
          setIsSubmitting(false);
          return;
        }
      }

      // Reload applications
      const updatedApps = await getAllApplications();
      setApplications(updatedApps);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setFormError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!selectedApp) return;

    try {
      const result = await deleteApplication(selectedApp.id);
      if (result.success) {
        // Reload applications
        const updatedApps = await getAllApplications();
        setApplications(updatedApps);
        setShowDeleteModal(false);
        setShowDetailsModal(false);
        setSelectedApp(null);
      }
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  const handleQuickDelete = (e: React.MouseEvent, app: Application) => {
    e.stopPropagation();
    setSelectedApp(app);
    setShowDeleteModal(true);
  };

  const handleQuickEdit = (e: React.MouseEvent, app: Application) => {
    e.stopPropagation();
    handleOpenEditModal(app);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, app: Application) => {
    setDraggedApp(app);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (status: ApplicationStatus) => {
    if (!draggedApp) return;

    if (draggedApp.status !== status) {
      await updateApplication(draggedApp.id, { status });
      // Reload applications
      const updatedApps = await getAllApplications();
      setApplications(updatedApps);
    }

    setDraggedApp(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedApp(null);
    setDragOverColumn(null);
  };

  const getPriorityBorderColor = (priority: Priority) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "saved":
        return "bg-gray-50";
      case "applied":
        return "bg-blue-50";
      case "interview":
        return "bg-purple-50";
      case "offer":
        return "bg-green-50";
      case "rejected":
        return "bg-red-50";
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case "saved":
        return <Save className="h-4 w-4 text-gray-500" />;
      case "applied":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "interview":
        return <Target className="h-4 w-4 text-purple-500" />;
      case "offer":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusHeaderColor = (status: ApplicationStatus) => {
    switch (status) {
      case "saved":
        return "bg-gray-100 border-gray-200";
      case "applied":
        return "bg-blue-100 border-blue-200";
      case "interview":
        return "bg-purple-100 border-purple-200";
      case "offer":
        return "bg-green-100 border-green-200";
      case "rejected":
        return "bg-red-100 border-red-200";
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
    }
  };

  const getJobSourceLabel = (source: JobSource) => {
    switch (source) {
      case "linkedin": return "LinkedIn";
      case "indeed": return "Indeed";
      case "company_website": return "Company Website";
      case "referral": return "Referral";
      case "recruiter": return "Recruiter";
      case "other": return "Other";
    }
  };

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        app.companyName.toLowerCase().includes(query) ||
        app.positionTitle.toLowerCase().includes(query) ||
        (app.location && app.location.toLowerCase().includes(query))
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

  const statusColumns: { status: ApplicationStatus; title: string }[] = [
    { status: "saved", title: "Saved" },
    { status: "applied", title: "Applied" },
    { status: "interview", title: "Interview" },
    { status: "offer", title: "Offer" },
    { status: "rejected", title: "Rejected" },
  ];

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="inline-block h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Application Tracker
            </h1>
            <p className="text-gray-500">
              {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex rounded-lg border border-gray-200 bg-white shadow-sm">
              <button
                onClick={() => setViewMode("board")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-l-lg ${
                  viewMode === "board"
                    ? "bg-blue-600 text-white shadow-inner"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Board
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-r-lg ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white shadow-inner"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <List className="h-4 w-4" />
                List
              </button>
            </div>

            {/* Add Button */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
            >
              <Plus className="h-5 w-5" />
              Add
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, position, or location..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Board View */}
        {viewMode === "board" && (
          <div className="grid gap-4 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2">
            {statusColumns.map((column) => {
              const columnApps = applicationsByStatus[column.status];
              const isExpanded = expandedColumns.has(column.status);
              const visibleApps = isExpanded ? columnApps : columnApps.slice(0, CARDS_PER_COLUMN);
              const hiddenCount = columnApps.length - CARDS_PER_COLUMN;

              return (
                <div
                  key={column.status}
                  className="flex flex-col"
                  onDragOver={(e) => handleDragOver(e, column.status)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop(column.status)}
                >
                  {/* Column Header */}
                  <div className={`mb-3 rounded-xl p-3 border ${getStatusHeaderColor(column.status)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(column.status)}
                        <h3 className="font-semibold text-gray-900">
                          {column.title}
                        </h3>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-gray-700 shadow-sm">
                        {columnApps.length}
                      </span>
                    </div>
                  </div>

                  {/* Drop Zone Indicator */}
                  <div
                    className={`flex-1 rounded-xl transition-all ${
                      dragOverColumn === column.status
                        ? "bg-blue-50 border-2 border-dashed border-blue-300"
                        : ""
                    }`}
                  >
                    {/* Column Cards */}
                    <div className="space-y-3">
                      {columnApps.length === 0 ? (
                        <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
                          <Briefcase className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">No applications</p>
                          <button
                            onClick={() => {
                              resetForm();
                              setFormData(prev => ({ ...prev, status: column.status }));
                              setShowAddModal(true);
                            }}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            + Add here
                          </button>
                        </div>
                      ) : (
                        <>
                          {visibleApps.map((app) => (
                            <div
                              key={app.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, app)}
                              onDragEnd={handleDragEnd}
                              onClick={() => {
                                setSelectedApp(app);
                                setShowDetailsModal(true);
                              }}
                              onMouseEnter={() => setHoveredCardId(app.id)}
                              onMouseLeave={() => setHoveredCardId(null)}
                              className={`group relative cursor-pointer rounded-xl border-l-4 bg-white p-4 shadow-sm hover:shadow-md transition-all ${
                                getPriorityBorderColor(app.priority)
                              } ${draggedApp?.id === app.id ? "opacity-50 scale-95" : ""}`}
                            >
                              {/* Drag Handle */}
                              <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity">
                                <GripVertical className="h-4 w-4 text-gray-400" />
                              </div>

                              {/* Quick Actions */}
                              {hoveredCardId === app.id && (
                                <div className="absolute right-2 top-2 flex items-center gap-1 bg-white rounded-lg shadow-md border border-gray-100 p-1">
                                  <button
                                    onClick={(e) => handleQuickEdit(e, app)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => handleQuickDelete(e, app)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}

                              {/* Company & Position */}
                              <h4 className="font-semibold text-gray-900 text-sm mb-0.5 pr-16 truncate">
                                {app.companyName}
                              </h4>
                              <p className="text-xs text-gray-500 mb-3 truncate">
                                {app.positionTitle}
                              </p>

                              {/* Meta Info */}
                              <div className="space-y-1.5">
                                {app.appliedDate && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <Calendar className="h-3 w-3 flex-shrink-0" />
                                    <span>{new Date(app.appliedDate).toLocaleDateString()}</span>
                                  </div>
                                )}

                                {app.location && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">
                                      {app.location}
                                      {app.isRemote && <span className="text-green-600 ml-1">• Remote</span>}
                                    </span>
                                  </div>
                                )}

                                {app.salary && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <DollarSign className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{app.salary}</span>
                                  </div>
                                )}
                              </div>

                              {/* Footer with source */}
                              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                                  {getJobSourceLabel(app.jobSource || 'other')}
                                </span>
                                {app.followUpDate && new Date(app.followUpDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                                  <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Follow up
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Show More/Less Button */}
                          {hiddenCount > 0 && (
                            <button
                              onClick={() => toggleColumnExpand(column.status)}
                              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-1 transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  Show less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  Show {hiddenCount} more
                                </>
                              )}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {filteredApplications.length === 0 ? (
              <div className="py-16 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">No applications found</p>
                <button
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Application
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Company / Position
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Source
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Applied
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Location
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredApplications.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedApp(app);
                          setShowDetailsModal(true);
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-1 h-10 rounded-full ${
                              app.priority === 'high' ? 'bg-red-500' :
                              app.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                            <div>
                              <p className="font-semibold text-gray-900">{app.companyName}</p>
                              <p className="text-sm text-gray-500">{app.positionTitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                            {getStatusIcon(app.status)}
                            <span className="capitalize">{app.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(app.priority)}`}>
                            {app.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {getJobSourceLabel(app.jobSource || 'other')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="truncate block max-w-[150px]">
                            {app.location ? `${app.location}${app.isRemote ? ' • Remote' : ''}` : "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => handleQuickEdit(e, app)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleQuickDelete(e, app)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {isEditMode ? "Edit Application" : "Add Application"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitApplication} className="p-6 space-y-5">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Google, Apple, etc."
                    disabled={isSubmitting}
                  />
                </div>

                {/* Position Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Position Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.positionTitle}
                    onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Senior Software Engineer"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Status, Priority, Job Source */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      disabled={isSubmitting}
                    >
                      <option value="saved">Saved</option>
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      disabled={isSubmitting}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Source</label>
                    <select
                      value={formData.jobSource}
                      onChange={(e) => setFormData({ ...formData, jobSource: e.target.value as JobSource })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      disabled={isSubmitting}
                    >
                      <option value="linkedin">LinkedIn</option>
                      <option value="indeed">Indeed</option>
                      <option value="company_website">Company Website</option>
                      <option value="referral">Referral</option>
                      <option value="recruiter">Recruiter</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Applied Date</label>
                    <input
                      type="date"
                      value={formData.appliedDate}
                      onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Follow-up Date</label>
                    <input
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Location and Salary */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="San Francisco, CA"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Salary Range</label>
                    <input
                      type="text"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="$100k - $150k"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Remote Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    id="remote"
                    type="checkbox"
                    checked={formData.isRemote}
                    onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="remote" className="text-sm text-gray-700">Remote position</label>
                </div>

                {/* Job URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Posting URL</label>
                  <input
                    type="url"
                    value={formData.jobUrl}
                    onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="https://..."
                    disabled={isSubmitting}
                  />
                </div>

                {/* Contact Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Person</label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Jane Doe (Recruiter)"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email</label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="jane@company.com"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    placeholder="Interview notes, requirements, etc..."
                    disabled={isSubmitting}
                  />
                </div>

                {/* Error Message */}
                {formError && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 p-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
                    <p className="text-sm text-red-600">{formError}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {isEditMode ? "Update" : "Save"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-10 rounded-full ${
                      selectedApp.priority === 'high' ? 'bg-red-500' :
                      selectedApp.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedApp.companyName}</h2>
                      <p className="text-gray-500">{selectedApp.positionTitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedApp(null);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Status and Priority */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedApp.status)}`}>
                    {getStatusIcon(selectedApp.status)}
                    <span className="capitalize">{selectedApp.status}</span>
                  </div>
                  <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${getPriorityColor(selectedApp.priority)}`}>
                    {selectedApp.priority} priority
                  </span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                    {getJobSourceLabel(selectedApp.jobSource || 'other')}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {selectedApp.appliedDate && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Applied</p>
                        <p className="text-gray-900 font-medium">{new Date(selectedApp.appliedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                  {selectedApp.followUpDate && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Follow-up</p>
                        <p className="text-gray-900 font-medium">{new Date(selectedApp.followUpDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                  {selectedApp.location && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                        <p className="text-gray-900 font-medium">
                          {selectedApp.location}
                          {selectedApp.isRemote && <span className="text-green-600 ml-1">• Remote</span>}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedApp.salary && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Salary</p>
                        <p className="text-gray-900 font-medium">{selectedApp.salary}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                {(selectedApp.contactPerson || selectedApp.contactEmail) && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-2">Contact</p>
                    {selectedApp.contactPerson && (
                      <p className="text-gray-900 font-medium">{selectedApp.contactPerson}</p>
                    )}
                    {selectedApp.contactEmail && (
                      <a href={`mailto:${selectedApp.contactEmail}`} className="text-blue-600 hover:underline text-sm">
                        {selectedApp.contactEmail}
                      </a>
                    )}
                  </div>
                )}

                {/* Job URL */}
                {selectedApp.jobUrl && (
                  <a
                    href={selectedApp.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Job Posting
                  </a>
                )}

                {/* Notes */}
                {selectedApp.notes && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Notes</p>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedApp.notes}</p>
                    </div>
                  </div>
                )}



                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowDeleteModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleOpenEditModal(selectedApp);
                    }}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Application</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the application for{" "}
                <span className="font-semibold text-gray-900">{selectedApp.positionTitle}</span> at{" "}
                <span className="font-semibold text-gray-900">{selectedApp.companyName}</span>?
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteApplication}
                  className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
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
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <TrackerContent />
    </Suspense>
  );
}
