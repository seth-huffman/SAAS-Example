import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import { Search, Users, X } from 'lucide-react';
import type { Employee } from '../types/employee.types';

function initials(e: Employee) {
  return `${e.firstName[0]}${e.lastName[0]}`.toUpperCase();
}

function OrgNode({ employee, variant = 'default', onClick }: {
  employee: Employee;
  variant?: 'selected' | 'ancestor' | 'report' | 'default';
  onClick?: () => void;
}) {
  return (
    <button
      className={`org-node org-node--${variant}`}
      onClick={onClick}
      type="button"
    >
      <div className="org-node__avatar">{initials(employee)}</div>
      <div className="org-node__info">
        <p className="org-node__name">{employee.firstName} {employee.lastName}</p>
        {employee.jobTitle && <p className="org-node__title">{employee.jobTitle}</p>}
        {employee.department?.name && <p className="org-node__dept">{employee.department.name}</p>}
      </div>
    </button>
  );
}

function ReportTree({ employee, employees, onSelect, visited }: {
  employee: Employee;
  employees: Employee[];
  onSelect: (id: string) => void;
  visited: Set<string>;
}) {
  const reports = employees.filter(
    (e) => e.supervisorId === employee.id && !visited.has(e.id),
  );
  if (reports.length === 0) return null;

  const nextVisited = new Set(visited).add(employee.id);

  return (
    <>
      <div className="org-tree-vline" />
      <div className="org-tree-children">
        {reports.map((r) => (
          <div key={r.id} className="org-tree-child">
            <OrgNode employee={r} variant="report" onClick={() => onSelect(r.id)} />
            <ReportTree
              employee={r}
              employees={employees}
              onSelect={onSelect}
              visited={nextVisited}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export function OrgChartPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [listPage, setListPage] = useState(1);
  const PAGE_SIZE = 9;

  const { data: empData, isLoading } = useQuery({
    queryKey: ['employees', { page: 1, limit: 200 }],
    queryFn: () => employeesApi.list({ page: 1, limit: 200 }),
  });

  const { data: me } = useQuery({
    queryKey: ['employees', 'me'],
    queryFn: employeesApi.me,
    retry: false,
  });

  const employees: Employee[] = empData?.data ?? [];

  useEffect(() => {
    if (!selectedId && me?.id) {
      setSelectedId(me.id);
    }
  }, [me, selectedId]);

  const empMap = useMemo(() => {
    const map = new Map<string, Employee>();
    employees.forEach((e) => map.set(e.id, e));
    return map;
  }, [employees]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return empMap.get(selectedId) ?? (selectedId === me?.id ? me ?? null : null);
  }, [selectedId, empMap, me]);

  const upChain = useMemo(() => {
    if (!selected) return [];
    const chain: Employee[] = [];
    let current: Employee = selected;
    while (current.supervisorId) {
      const sup = empMap.get(current.supervisorId);
      if (!sup) {
        if (current.supervisor) chain.unshift(current.supervisor as unknown as Employee);
        break;
      }
      chain.unshift(sup);
      current = sup;
    }
    return chain;
  }, [selected, empMap]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      (e.jobTitle ?? '').toLowerCase().includes(q) ||
      (e.department?.name ?? '').toLowerCase().includes(q),
    );
  }, [employees, search]);

  useEffect(() => {
    setListPage(1);
  }, [search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((listPage - 1) * PAGE_SIZE, listPage * PAGE_SIZE);

  return (
    <div className="page org-page">

      {/* ── Header with inline search ─────────────────────── */}
      <div className="page__header">
        <h1 className="page__title">Org Chart</h1>
        <div className="org-page__header-right">
          <span className="org-page__count">{employees.length} employees</span>
          <div className="job-filters__search org-page__search">
            <Search size={14} className="job-filters__icon" />
            <input
              type="text"
              placeholder="Search employees…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input job-filters__input"
            />
            {search && (
              <button className="job-filters__clear" onClick={() => setSearch('')}>
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Two-panel layout ──────────────────────────────── */}
      <div className="jobs-layout org-layout">

        {/* Left panel — styled like job postings list */}
        <div className="org-layout__list">
          <div className="jobs-list-scroll">
            {isLoading ? (
              <p className="jobs-list-empty">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="jobs-list-empty">{search ? 'No employees match' : 'No employees found'}</p>
            ) : (
              <>
                {paginated.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    className={`jobs-list-item${selectedId === e.id ? ' jobs-list-item--selected' : ''}`}
                    onClick={() => setSelectedId(e.id)}
                  >
                    <div className="org-list-item__avatar">{initials(e)}</div>
                    <div className="org-list-item__body">
                      <span className="org-list-item__name">{e.firstName} {e.lastName}</span>
                      {e.jobTitle && <span className="org-list-item__title">{e.jobTitle}</span>}
                    </div>
                  </button>
                ))}
                {totalPages > 1 && (
                  <div className="org-list-pagination">
                    <button
                      type="button"
                      className="org-list-pagination__btn"
                      disabled={listPage === 1}
                      onClick={() => setListPage((p) => p - 1)}
                    >
                      Previous
                    </button>
                    <span className="org-list-pagination__info">
                      {listPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      className="org-list-pagination__btn"
                      disabled={listPage === totalPages}
                      onClick={() => setListPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="org-layout__detail">
          {!selected ? (
            <div className="org-detail-empty">
              <Users size={36} style={{ opacity: 0.2, marginBottom: 12 }} />
              <p>Select an employee to view their reporting chain</p>
            </div>
          ) : (
            <div className="org-chain">

              {upChain.map((ancestor, i) => (
                <div key={ancestor.id} className="org-chain__step">
                  <OrgNode
                    employee={ancestor}
                    variant="ancestor"
                    onClick={() => setSelectedId(ancestor.id)}
                  />
                  <div className="org-chain__connector" />
                </div>
              ))}

              <OrgNode employee={selected} variant="selected" />

              <ReportTree
                employee={selected}
                employees={employees}
                onSelect={setSelectedId}
                visited={new Set([selected.id])}
              />

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
