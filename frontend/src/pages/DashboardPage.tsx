import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { dashboardApi } from '../api/dashboard.api';
import { leaveRequestsApi } from '../api/leave-requests.api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Users, Building2, CalendarDays, TrendingUp,
  Check, X, Settings2, Maximize2, Minimize2, Plus, GripVertical,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { LeaveRequest } from '../types/leave-request.types';

// ─── Prefs ────────────────────────────────────────────────────────────────────
interface DashPrefs {
  hidden: string[];
  wide: string[];
  sectionOrder: string[];
  statOrder: string[];
  twoColOrder: string[];
}

const DEFAULT_PREFS: DashPrefs = {
  hidden: [],
  wide: [],
  sectionOrder: ['stat-grid', 'pending-requests', 'two-col'],
  statOrder: ['stat-headcount', 'stat-departments', 'stat-pending', 'stat-deptcount'],
  twoColOrder: ['dept-breakdown', 'recent-hires'],
};

const PREFS_KEY = 'hr-dash-prefs';

function loadPrefs(): DashPrefs {
  try {
    const raw = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '');
    return {
      hidden:       Array.isArray(raw.hidden)       ? raw.hidden       : DEFAULT_PREFS.hidden,
      wide:         Array.isArray(raw.wide)         ? raw.wide         : DEFAULT_PREFS.wide,
      sectionOrder: Array.isArray(raw.sectionOrder) ? raw.sectionOrder : DEFAULT_PREFS.sectionOrder,
      statOrder:    Array.isArray(raw.statOrder)    ? raw.statOrder    : DEFAULT_PREFS.statOrder,
      twoColOrder:  Array.isArray(raw.twoColOrder)  ? raw.twoColOrder  : DEFAULT_PREFS.twoColOrder,
    };
  } catch { return DEFAULT_PREFS; }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const LEAVE_LABELS: Record<string, string> = {
  vacation: 'Vacation', sick: 'Sick', personal: 'Personal', other: 'Other',
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Sortable section wrapper (for main sections and two-col cards) ───────────
function SortableSection({
  id, children, className, style,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn('sortable-section', isDragging && 'sortable-section--dragging', className)}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
        ...style,
      }}
    >
      <div className="dash-drag-handle" {...attributes} {...listeners} title="Drag to reorder">
        <GripVertical size={14} />
      </div>
      {children}
    </div>
  );
}

// ─── Sortable stat card (whole card is the drag surface) ─────────────────────
function SortableStatCard({
  id, title, value, icon, subtitle,
  editMode, hidden, onHide, onRestore,
}: {
  id: string; title: string; value: number; icon: React.ReactNode; subtitle?: string;
  editMode: boolean; hidden: boolean; onHide: () => void; onRestore: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: hidden,
  });

  if (hidden) {
    if (!editMode) return null;
    return (
      <div className="stat-card--ghost">
        <span className="ghost-label">{title}</span>
        <button className="card-ctrl-btn" onClick={onRestore}>
          <Plus size={11} /> Restore
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={cn('sortable-stat', isDragging && 'sortable-stat--dragging')}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.45 : 1 }}
    >
      {/* drag surface on the grip icon so buttons still work in edit mode */}
      <div className="stat-drag-handle" {...attributes} {...listeners} title="Drag to reorder">
        <GripVertical size={12} />
      </div>
      {editMode && (
        <button className="stat-ctrl-hide" onClick={onHide} title="Hide">
          <X size={10} />
        </button>
      )}
      <Card>
        <div className="stat-card__header">
          <span className="stat-card__label-sm">{title}</span>
          {icon}
        </div>
        <CardContent>
          <div className="stat-card__value">{value}</div>
          {subtitle && <p className="stat-card__subtitle">{subtitle}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Section wrap (show/hide + resize controls) ───────────────────────────────
function SectionWrap({
  label, canResize = true, editMode, hidden, wide,
  onHide, onRestore, onToggleWide, children,
}: {
  label: string; canResize?: boolean; editMode: boolean; hidden: boolean; wide: boolean;
  onHide: () => void; onRestore: () => void; onToggleWide: () => void;
  children: React.ReactNode;
}) {
  if (hidden) {
    if (!editMode) return null;
    return (
      <div className="ghost-section">
        <span className="ghost-label">{label}</span>
        <button className="card-ctrl-btn" onClick={onRestore}><Plus size={11} /> Restore</button>
      </div>
    );
  }
  return (
    <div className={cn('section-content', editMode && 'section-content--edit')}>
      {editMode && (
        <div className="section-controls">
          {canResize && (
            <button className="card-ctrl-btn" onClick={onToggleWide}>
              {wide ? <><Minimize2 size={11} /> Collapse</> : <><Maximize2 size={11} /> Expand</>}
            </button>
          )}
          <button className="card-ctrl-btn card-ctrl-btn--remove" onClick={onHide}>
            <X size={11} /> Hide
          </button>
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [prefs, setPrefs] = useState<DashPrefs>(loadPrefs);

  function savePrefs(next: DashPrefs) {
    setPrefs(next);
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  }

  const hideCard    = (id: string) => savePrefs({ ...prefs, hidden: [...prefs.hidden, id] });
  const showCard    = (id: string) => savePrefs({ ...prefs, hidden: prefs.hidden.filter(h => h !== id) });
  const toggleWide  = (id: string) => savePrefs({
    ...prefs,
    wide: prefs.wide.includes(id) ? prefs.wide.filter(w => w !== id) : [...prefs.wide, id],
  });
  const isHidden = (id: string) => prefs.hidden.includes(id);
  const isWide   = (id: string) => prefs.wide.includes(id);

  // ── Sensors ─────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // ── Data queries ────────────────────────────────────────────────────────
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.getStats,
  });

  const { data: pending = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['leave-requests', 'pending'],
    queryFn: leaveRequestsApi.listPending,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => leaveRequestsApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      toast.success('Leave request approved');
    },
    onError: () => toast.error('Failed to approve'),
  });
  const rejectMutation = useMutation({
    mutationFn: (id: string) => leaveRequestsApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      toast.success('Leave request rejected');
    },
    onError: () => toast.error('Failed to reject'),
  });
  const isMutating = approveMutation.isPending || rejectMutation.isPending;

  if (isLoading) {
    return (
      <div className="page">
        <h1 className="page__title">Dashboard</h1>
        <div className="stat-grid">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}><CardContent><div className="skeleton" style={{ height: '64px' }} /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  // ── Stat card config ─────────────────────────────────────────────────────
  const STAT_CONFIG: Record<string, { title: string; value: number; icon: React.ReactNode; subtitle?: string }> = {
    'stat-headcount':   { title: 'Active Employees', value: stats?.headcount ?? 0,               icon: <Users size={20} style={{ color: 'var(--muted-foreground)' }} /> },
    'stat-departments': { title: 'Departments',       value: stats?.totalDepartments ?? 0,         icon: <Building2 size={20} style={{ color: 'var(--muted-foreground)' }} /> },
    'stat-pending':     { title: 'Pending Leaves',    value: stats?.pendingLeaves ?? 0,            icon: <CalendarDays size={20} style={{ color: 'var(--muted-foreground)' }} /> },
    'stat-deptcount':   { title: 'Dept. Breakdown',   value: stats?.departmentBreakdown.length ?? 0, icon: <TrendingUp size={20} style={{ color: 'var(--muted-foreground)' }} />, subtitle: 'active departments' },
  };

  // ── Renderers ────────────────────────────────────────────────────────────
  function renderStatGrid() {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) return;
          const oldIdx = prefs.statOrder.indexOf(String(active.id));
          const newIdx = prefs.statOrder.indexOf(String(over.id));
          savePrefs({ ...prefs, statOrder: arrayMove(prefs.statOrder, oldIdx, newIdx) });
        }}
      >
        <SortableContext items={prefs.statOrder} strategy={horizontalListSortingStrategy}>
          <div className="stat-grid">
            {prefs.statOrder.map(id => {
              const cfg = STAT_CONFIG[id];
              if (!cfg) return null;
              return (
                <SortableStatCard
                  key={id} id={id}
                  title={cfg.title} value={cfg.value} icon={cfg.icon} subtitle={cfg.subtitle}
                  editMode={editMode} hidden={isHidden(id)}
                  onHide={() => hideCard(id)} onRestore={() => showCard(id)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  function renderPendingRequests() {
    return (
      <SectionWrap
        label="Pending Leave Requests" canResize={false}
        editMode={editMode} hidden={isHidden('pending-requests')} wide={false}
        onHide={() => hideCard('pending-requests')} onRestore={() => showCard('pending-requests')} onToggleWide={() => {}}
      >
        <Card>
          <CardHeader>
            <div className="pending-requests__header">
              <CardTitle>Pending Leave Requests</CardTitle>
              {!pendingLoading && (
                <Badge className={pending.length > 0 ? 'badge--pending' : 'badge--approved'}>
                  {pending.length} pending
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="card__content--flush">
            {pendingLoading ? (
              <div className="pending-requests__empty">Loading…</div>
            ) : pending.length === 0 ? (
              <div className="pending-requests__empty">No pending requests — you're all caught up.</div>
            ) : (
              <ul className="pending-list">
                {pending.map((lr: LeaveRequest) => (
                  <li key={lr.id} className="pending-item">
                    <div className="pending-item__avatar">
                      {lr.employee ? `${lr.employee.firstName[0]}${lr.employee.lastName[0]}` : '?'}
                    </div>
                    <div className="pending-item__info">
                      <p className="pending-item__name">
                        {lr.employee ? `${lr.employee.firstName} ${lr.employee.lastName}` : 'Unknown Employee'}
                      </p>
                      <p className="pending-item__meta">
                        <Badge className="badge--outline" style={{ fontSize: '0.7rem', height: '18px' }}>
                          {LEAVE_LABELS[lr.leaveType] ?? lr.leaveType}
                        </Badge>
                        <span>{fmtDate(lr.startDate)} – {fmtDate(lr.endDate)}</span>
                        {lr.reason && <span className="pending-item__reason">"{lr.reason}"</span>}
                      </p>
                    </div>
                    <div className="pending-item__actions">
                      <Button size="sm"
                        onClick={() => approveMutation.mutate(lr.id)} disabled={isMutating}>
                        <Check size={12} /> Approve
                      </Button>
                      <Button size="sm" className="btn--green"
                        onClick={() => rejectMutation.mutate(lr.id)} disabled={isMutating}>
                        <X size={12} /> Deny
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </SectionWrap>
    );
  }

  function renderTwoCol() {
    const TWO_COL_CONTENT: Record<string, React.ReactNode> = {
      'dept-breakdown': (
        <SectionWrap
          label="Department Breakdown"
          editMode={editMode} hidden={isHidden('dept-breakdown')} wide={isWide('dept-breakdown')}
          onHide={() => hideCard('dept-breakdown')} onRestore={() => showCard('dept-breakdown')}
          onToggleWide={() => toggleWide('dept-breakdown')}
        >
          <Card>
            <CardHeader><CardTitle>Department Breakdown</CardTitle></CardHeader>
            <CardContent>
              {!stats?.departmentBreakdown.length ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>No departments yet</p>
              ) : (
                <div className="dept-breakdown">
                  {stats.departmentBreakdown.map((d) => {
                    const max = Math.max(...stats.departmentBreakdown.map(x => x.count), 1);
                    const pct = Math.round((d.count / max) * 100);
                    return (
                      <div key={d.departmentId ?? 'unassigned'}>
                        <div className="progress-label">
                          <span>{d.departmentName}</span><span>{d.count}</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </SectionWrap>
      ),
      'recent-hires': (
        <SectionWrap
          label="Recent Hires"
          editMode={editMode} hidden={isHidden('recent-hires')} wide={isWide('recent-hires')}
          onHide={() => hideCard('recent-hires')} onRestore={() => showCard('recent-hires')}
          onToggleWide={() => toggleWide('recent-hires')}
        >
          <Card>
            <CardHeader><CardTitle>Recent Hires</CardTitle></CardHeader>
            <CardContent>
              {!stats?.recentHires.length ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>No recent hires</p>
              ) : (
                <ul className="hire-list">
                  {stats.recentHires.map((emp) => (
                    <li key={emp.id} className="hire-item">
                      <div className="hire-item__avatar">{emp.firstName[0]}{emp.lastName[0]}</div>
                      <div>
                        <p className="hire-item__name">{emp.firstName} {emp.lastName}</p>
                        <p className="hire-item__meta">{emp.jobTitle ?? emp.department?.name ?? 'No title'}</p>
                      </div>
                      <span className="hire-item__date">
                        {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </SectionWrap>
      ),
    };

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) return;
          const oldIdx = prefs.twoColOrder.indexOf(String(active.id));
          const newIdx = prefs.twoColOrder.indexOf(String(over.id));
          savePrefs({ ...prefs, twoColOrder: arrayMove(prefs.twoColOrder, oldIdx, newIdx) });
        }}
      >
        <SortableContext items={prefs.twoColOrder} strategy={horizontalListSortingStrategy}>
          <div className="two-col-grid">
            {prefs.twoColOrder.map(id => (
              <SortableSection
                key={id} id={id}
                style={isWide(id) ? { gridColumn: '1 / -1' } : undefined}
              >
                {TWO_COL_CONTENT[id]}
              </SortableSection>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  const SECTION_RENDERERS: Record<string, () => React.ReactNode> = {
    'stat-grid':         renderStatGrid,
    'pending-requests':  renderPendingRequests,
    'two-col':           renderTwoCol,
  };

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Dashboard</h1>
        <Button
          variant={editMode ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setEditMode(e => !e)}
        >
          {editMode ? 'Done Editing' : <><Settings2 size={14} /> Customize</>}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) return;
          const oldIdx = prefs.sectionOrder.indexOf(String(active.id));
          const newIdx = prefs.sectionOrder.indexOf(String(over.id));
          if (oldIdx === -1 || newIdx === -1) return;
          savePrefs({ ...prefs, sectionOrder: arrayMove(prefs.sectionOrder, oldIdx, newIdx) });
        }}
      >
        <SortableContext items={prefs.sectionOrder} strategy={verticalListSortingStrategy}>
          <div className="dash-sections">
            {prefs.sectionOrder.map(id => (
              <SortableSection key={id} id={id}>
                {SECTION_RENDERERS[id]?.()}
              </SortableSection>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
