/**
 * Notification trigger helpers.
 *
 * These functions create notifications by calling the API directly,
 * so they can be used from any context or component without depending
 * on NotificationContext (avoiding circular dependencies).
 */

import * as api from './api';
import type { NotificationType, NotificationPriority } from '../types';

interface TriggerOptions {
  companyId: string;
  triggeredByUserId?: string;
}

// ─── Task Notifications ────────────────────────────────────

export async function notifyTaskAssigned(
  opts: TriggerOptions & {
    assigneeUserId: string;
    taskId: string;
    taskTitle: string;
  },
) {
  // Don't notify users about their own actions
  if (opts.assigneeUserId === opts.triggeredByUserId) return;
  try {
    await api.createNotification({
      companyId: opts.companyId,
      recipientUserId: opts.assigneeUserId,
      type: 'task_assigned',
      priority: 'normal',
      title: `Neue Aufgabe zugewiesen: ${opts.taskTitle}`,
      body: 'Dir wurde eine neue Aufgabe zugewiesen.',
      entityType: 'task',
      entityId: opts.taskId,
      actionUrl: `/company/${opts.companyId}/tasks`,
      triggeredByUserId: opts.triggeredByUserId,
    });
  } catch (err) {
    console.warn('[notifyTaskAssigned] failed:', err);
  }
}

export async function notifyTaskStatusChanged(
  opts: TriggerOptions & {
    recipientUserIds: string[];
    taskId: string;
    taskTitle: string;
    oldStatus: string;
    newStatus: string;
  },
) {
  const statusLabels: Record<string, string> = {
    draft: 'Entwurf', ai_generating: 'KI generiert', ai_ready: 'KI fertig',
    revision: 'Überarbeitung', review: 'Review', approved: 'Freigegeben',
    scheduled: 'Geplant', live: 'Live', monitoring: 'Monitoring', analyzed: 'Analysiert',
  };
  const label = statusLabels[opts.newStatus] ?? opts.newStatus;

  for (const recipientId of opts.recipientUserIds) {
    if (recipientId === opts.triggeredByUserId) continue;
    try {
      await api.createNotification({
        companyId: opts.companyId,
        recipientUserId: recipientId,
        type: 'task_status_changed',
        title: `Aufgabe "${opts.taskTitle}" → ${label}`,
        body: `Status geändert von ${statusLabels[opts.oldStatus] ?? opts.oldStatus} zu ${label}.`,
        entityType: 'task',
        entityId: opts.taskId,
        actionUrl: `/company/${opts.companyId}/tasks`,
        triggeredByUserId: opts.triggeredByUserId,
      });
    } catch (err) {
      console.warn('[notifyTaskStatusChanged] failed for', recipientId, err);
    }
  }
}

export async function notifyAiGenerationComplete(
  opts: TriggerOptions & {
    recipientUserId: string;
    taskId: string;
    taskTitle: string;
    success: boolean;
  },
) {
  try {
    await api.createNotification({
      companyId: opts.companyId,
      recipientUserId: opts.recipientUserId,
      type: 'ai_generation_complete',
      title: opts.success
        ? `KI-Entwurf fertig: ${opts.taskTitle}`
        : `KI-Fehler bei: ${opts.taskTitle}`,
      body: opts.success
        ? 'Der KI-generierte Entwurf steht zur Überprüfung bereit.'
        : 'Bei der KI-Generierung ist ein Fehler aufgetreten.',
      entityType: 'task',
      entityId: opts.taskId,
      actionUrl: `/company/${opts.companyId}/tasks`,
      priority: opts.success ? 'normal' : 'high',
    });
  } catch (err) {
    console.warn('[notifyAiGenerationComplete] failed:', err);
  }
}

// ─── Campaign Notifications ────────────────────────────────

export async function notifyCampaignStatusChanged(
  opts: TriggerOptions & {
    recipientUserIds: string[];
    campaignId: string;
    campaignName: string;
    newStatus: string;
  },
) {
  const statusLabels: Record<string, string> = {
    active: 'Aktiv', planned: 'Geplant', completed: 'Abgeschlossen', paused: 'Pausiert',
  };
  const label = statusLabels[opts.newStatus] ?? opts.newStatus;

  for (const recipientId of opts.recipientUserIds) {
    if (recipientId === opts.triggeredByUserId) continue;
    try {
      await api.createNotification({
        companyId: opts.companyId,
        recipientUserId: recipientId,
        type: 'campaign_update',
        title: `Kampagne „${opts.campaignName}" → ${label}`,
        entityType: 'campaign',
        entityId: opts.campaignId,
        actionUrl: `/company/${opts.companyId}/campaigns/${opts.campaignId}`,
        triggeredByUserId: opts.triggeredByUserId,
      });
    } catch (err) {
      console.warn('[notifyCampaignStatusChanged] failed:', err);
    }
  }
}

export async function notifyCampaignCreated(
  opts: TriggerOptions & {
    recipientUserIds: string[];
    campaignId: string;
    campaignName: string;
  },
) {
  for (const recipientId of opts.recipientUserIds) {
    if (recipientId === opts.triggeredByUserId) continue;
    try {
      await api.createNotification({
        companyId: opts.companyId,
        recipientUserId: recipientId,
        type: 'campaign_update',
        title: `Neue Kampagne erstellt: ${opts.campaignName}`,
        body: 'Eine neue Kampagne wurde angelegt.',
        entityType: 'campaign',
        entityId: opts.campaignId,
        actionUrl: `/company/${opts.companyId}/campaigns/${opts.campaignId}`,
        triggeredByUserId: opts.triggeredByUserId,
      });
    } catch (err) {
      console.warn('[notifyCampaignCreated] failed:', err);
    }
  }
}

// ─── Budget Notifications ──────────────────────────────────

export async function notifyBudgetAlert(
  opts: TriggerOptions & {
    recipientUserIds: string[];
    campaignId?: string;
    campaignName: string;
    percentUsed: number;
  },
) {
  const isOver = opts.percentUsed >= 100;
  const priority: NotificationPriority = isOver ? 'urgent' : 'high';

  for (const recipientId of opts.recipientUserIds) {
    try {
      await api.createNotification({
        companyId: opts.companyId,
        recipientUserId: recipientId,
        type: 'budget_alert',
        priority,
        title: isOver
          ? `Budget überschritten: ${opts.campaignName} (${opts.percentUsed}%)`
          : `Budget-Warnung: ${opts.campaignName} bei ${opts.percentUsed}%`,
        body: isOver
          ? 'Das Budget wurde überschritten! Bitte prüfe die Ausgaben sofort.'
          : 'Das Budget nähert sich dem Limit. Bitte kontrolliere die Ausgaben.',
        entityType: 'campaign',
        entityId: opts.campaignId,
        actionUrl: `/company/${opts.companyId}/budget`,
      });
    } catch (err) {
      console.warn('[notifyBudgetAlert] failed:', err);
    }
  }
}

// ─── Content Notifications ─────────────────────────────────

export async function notifyContentStatusChanged(
  opts: TriggerOptions & {
    recipientUserIds: string[];
    contentId: string;
    contentTitle: string;
    newStatus: string;
  },
) {
  const typeMap: Record<string, NotificationType> = {
    ready: 'content_review',
    published: 'content_published',
  };
  const type = typeMap[opts.newStatus] ?? 'content_review';

  const statusLabels: Record<string, string> = {
    idea: 'Idee', planning: 'Planung', production: 'Produktion',
    ready: 'Bereit zur Freigabe', scheduled: 'Geplant', published: 'Veröffentlicht',
  };

  for (const recipientId of opts.recipientUserIds) {
    if (recipientId === opts.triggeredByUserId) continue;
    try {
      await api.createNotification({
        companyId: opts.companyId,
        recipientUserId: recipientId,
        type,
        title: `Content „${opts.contentTitle}" → ${statusLabels[opts.newStatus] ?? opts.newStatus}`,
        entityType: 'content',
        entityId: opts.contentId,
        actionUrl: `/company/${opts.companyId}/content`,
        triggeredByUserId: opts.triggeredByUserId,
      });
    } catch (err) {
      console.warn('[notifyContentStatusChanged] failed:', err);
    }
  }
}

// ─── Team Notifications ────────────────────────────────────

export async function notifyTeamMemberAdded(
  opts: TriggerOptions & {
    recipientUserIds: string[];
    newMemberName: string;
  },
) {
  for (const recipientId of opts.recipientUserIds) {
    if (recipientId === opts.triggeredByUserId) continue;
    try {
      await api.createNotification({
        companyId: opts.companyId,
        recipientUserId: recipientId,
        type: 'team_activity',
        title: `Neues Team-Mitglied: ${opts.newMemberName}`,
        body: `${opts.newMemberName} wurde dem Team hinzugefügt.`,
        actionUrl: `/company/${opts.companyId}/settings`,
        triggeredByUserId: opts.triggeredByUserId,
      });
    } catch (err) {
      console.warn('[notifyTeamMemberAdded] failed:', err);
    }
  }
}
