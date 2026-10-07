import React, { useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiPower,
  FiCheckCircle,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import PageHeader from "./PageHeader";

const normalizeRole = (role) => String(role || "").trim().toUpperCase();

const getRowId = (row) =>
  row?.id ?? row?.patient_id ?? row?.doctor_id ?? row?.uuid;

const getRows = (data) =>
  Array.isArray(data)
    ? data
    : data?.results || data?.data || data?.items || [];

export default function ResourcePage({
  title,
  subtitle,
  api,
  columns,
  fields = [],
  transformCreate = (value) => value,
  canWrite = true,
  canCreate = canWrite,
  manageRoles = null,
  showEdit = true,
  showDeactivate = true,
  showDelete = true,
  deactivateField = "is_active",
  emptyMessage = "No records found.",
  searchPlaceholder,
}) {
  const role = useSelector((state) => state.auth.role);

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [editing, setEditing] = useState(null);

  const currentRole = normalizeRole(role);

  const canManage =
    manageRoles === null
      ? canWrite
      : manageRoles.some(
          (allowedRole) =>
            normalizeRole(allowedRole) === currentRole,
        );

  const canEditRows = canManage && showEdit && !!api?.update;
  const canDeactivateRows =
    canManage && showDeactivate && !!api?.update;
  const canDeleteRows =
    canManage && showDelete && !!api?.remove;

  const load = async () => {
    setLoading(true);

    try {
      const data = await api.list(
        search.trim()
          ? { search: search.trim() }
          : undefined,
      );

      setRows(getRows(data));
    } catch (error) {
      toast.error(
        error?.message || "Failed to load records.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const initial = useMemo(
    () =>
      Object.fromEntries(
        fields.map((field) => [
          field.name,
          field.default ?? "",
        ]),
      ),
    [fields],
  );

  const startEdit = (row) => {
    setEditing(row);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(event.currentTarget);
      const payload = Object.fromEntries(
        formData.entries(),
      );

      const id = getRowId(editing);

      if (id !== undefined && id !== null) {
        if (!api?.update) {
          throw new Error(
            "Update operation is not available.",
          );
        }

        await api.update(
          id,
          transformCreate(payload, editing),
        );

        toast.success("Updated successfully.");
      } else {
        if (!api?.create) {
          throw new Error(
            "Create operation is not available.",
          );
        }

        await api.create(
          transformCreate(payload),
        );

        toast.success("Created successfully.");
      }

      setEditing(null);
      await load();
    } catch (error) {
      toast.error(
        error?.message || "Operation failed.",
      );
    } finally {
      setSaving(false);
    }
  };

  const changeActiveState = async (
    row,
    nextActive,
  ) => {
    const id = getRowId(row);

    if (
      id === undefined ||
      id === null ||
      !api?.update
    ) {
      toast.error(
        "Status update operation is not available.",
      );
      return;
    }

    const actionLabel = nextActive
      ? "activate"
      : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} this ${title.toLowerCase().replace(/s$/, "")}?`,
    );

    if (!confirmed) return;

    setActionId(id);

    try {
      await api.update(id, {
        [deactivateField]: nextActive,
      });

      toast.success(
        nextActive
          ? "Record activated successfully."
          : "Record deactivated successfully.",
      );

      await load();
    } catch (error) {
      toast.error(
        error?.message ||
          `Failed to ${actionLabel} record.`,
      );
    } finally {
      setActionId(null);
    }
  };

  const remove = async (row) => {
    const id = getRowId(row);

    if (
      id === undefined ||
      id === null ||
      !api?.remove
    ) {
      toast.error(
        "Delete operation is not available.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete this ${title.toLowerCase().replace(/s$/, "")}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setActionId(id);

    try {
      await api.remove(id);
      toast.success("Deleted successfully.");
      await load();
    } catch (error) {
      toast.error(
        error?.message || "Failed to delete record.",
      );
    } finally {
      setActionId(null);
    }
  };

  const renderField = (field) => {
    const value =
      editing?.[field.name] ??
      field.default ??
      "";

    if (field.type === "select") {
      return (
        <select
          name={field.name}
          defaultValue={value}
          required={field.required}
          className="input-field"
        >
          {field.options?.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "textarea") {
      return (
        <textarea
          name={field.name}
          defaultValue={value}
          required={field.required}
          className="input-field min-h-24"
        />
      );
    }

    return (
      <input
        name={field.name}
        type={field.type || "text"}
        defaultValue={value}
        required={field.required}
        placeholder={field.placeholder}
        className="input-field"
      />
    );
  };

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={
          canCreate ? (
            <button
              type="button"
              className="btn-primary flex items-center gap-2"
              onClick={() => setEditing(initial)}
            >
              <FiPlus />
              Add New
            </button>
          ) : null
        }
      />

      <div className="card mb-5 flex gap-3">
        <div className="flex-1 flex items-center bg-gray-100 rounded-lg px-3 py-2">
          <FiSearch className="text-gray-400" />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder={
              searchPlaceholder ||
              `Search ${title.toLowerCase()}...`
            }
            className="bg-transparent outline-none ml-2 w-full text-sm"
          />
        </div>

        <button
          type="button"
          className="btn-secondary flex items-center justify-center"
          onClick={load}
          disabled={loading}
          title="Refresh"
        >
          <FiRefreshCw
            className={
              loading ? "animate-spin" : ""
            }
          />
        </button>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading...
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="table-header px-4 py-3 whitespace-nowrap"
                  >
                    {column.label}
                  </th>
                ))}

                {(canEditRows ||
                  canDeactivateRows ||
                  canDeleteRows) && (
                  <th className="table-header px-4 py-3 whitespace-nowrap">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => {
                const id = getRowId(row);
                const active =
                  row?.[deactivateField] !== false;

                return (
                  <tr
                    key={id}
                    className="hover:bg-gray-50"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-4 py-3 text-sm text-gray-700"
                      >
                        {column.render
                          ? column.render(row)
                          : row?.[column.key] ?? "—"}
                      </td>
                    ))}

                    {(canEditRows ||
                      canDeactivateRows ||
                      canDeleteRows) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {canEditRows && (
                            <button
                              type="button"
                              title="Edit"
                              className="p-2 rounded-lg text-medicore-600 hover:bg-medicore-50 disabled:opacity-50"
                              disabled={
                                actionId === id
                              }
                              onClick={() =>
                                startEdit(row)
                              }
                            >
                              <FiEdit2 size={16} />
                            </button>
                          )}

                          {canDeactivateRows && (
                            <button
                              type="button"
                              title={
                                active
                                  ? "Deactivate"
                                  : "Activate"
                              }
                              className={`p-2 rounded-lg disabled:opacity-50 ${
                                active
                                  ? "text-amber-600 hover:bg-amber-50"
                                  : "text-green-600 hover:bg-green-50"
                              }`}
                              disabled={
                                actionId === id
                              }
                              onClick={() =>
                                changeActiveState(
                                  row,
                                  !active,
                                )
                              }
                            >
                              {active ? (
                                <FiPower size={16} />
                              ) : (
                                <FiCheckCircle
                                  size={16}
                                />
                              )}
                            </button>
                          )}

                          {canDeleteRows && (
                            <button
                              type="button"
                              title="Delete"
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                              disabled={
                                actionId === id
                              }
                              onClick={() =>
                                remove(row)
                              }
                            >
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && !rows.length && (
          <div className="p-8 text-center text-gray-500">
            {emptyMessage}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {getRowId(editing)
                    ? `Edit ${title}`
                    : `Add ${title}`}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Fill in the required fields and save.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <FiX />
              </button>
            </div>

            <form
              onSubmit={save}
              className="grid md:grid-cols-2 gap-4"
            >
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={
                    field.full
                      ? "md:col-span-2"
                      : ""
                  }
                >
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {field.label}
                    {field.required ? " *" : ""}
                  </label>

                  {renderField(field)}
                </div>
              ))}

              <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditing(null)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary min-w-24"
                >
                  {saving
                    ? "Saving..."
                    : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
