'use client';

import { useTranslation } from '@/lib/i18n';
import { ViewShell, ViewTabPanel } from '@/components/view-layout';
import {
  Puzzle,
  Radio,
  MousePointerClick,
  LayoutTemplate,
  Shield,
  BookOpen,
  Check,
  Globe,
  Mail,
  BarChart3,
  Clock,
  MapPin,
  Users,
  Unlock,
  Building2,
  Code,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function StepDot({ index }: { index: number }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[oklch(0.55_0.18_250/0.1)] text-xs font-semibold text-[oklch(0.55_0.18_250)]">
      {index}
    </span>
  );
}

function FeatureChip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-[#E8ECEF] bg-[#FAFBFC] px-3.5 py-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#E2F343]/20 text-[#1D141F]">
        {icon}
      </span>
      <span className="text-sm leading-relaxed text-[#1D141F]">{text}</span>
    </div>
  );
}

export function DocumentationView() {
  const { t } = useTranslation();

  return (
    <ViewShell>
      <ViewTabPanel>
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-2xl border border-[#E8ECEF] bg-white p-8 shadow-sm md:p-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D141F]">
                  <BookOpen className="h-5 w-5 text-[#E2F343]" />
                </div>
                <span className="rounded-full bg-[#E2F343]/15 px-2.5 py-0.5 text-xs font-semibold text-[#1D141F] tracking-wide uppercase">
                  {t.documentation.title}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1D141F]">
                {t.documentation.title}
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground max-w-2xl">
                {t.documentation.subtitle}
              </p>
            </div>
          </motion.div>

          {/* Widget Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="rounded-xl border border-[#E8ECEF] bg-white shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-[#E8ECEF] bg-[#FAFBFC] px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.55_0.18_250/0.1)]">
                <Puzzle className="h-4.5 w-4.5 text-[oklch(0.55_0.18_250)]" />
              </div>
              <h2 className="text-base font-semibold text-[#1D141F]">
                {t.documentation.sections.newsletterWidget.title}
              </h2>
              <span className="ml-auto flex items-center gap-1 rounded-full bg-[#E2F343]/20 px-2 py-0.5 text-[11px] font-semibold text-[#1D141F]">
                <Sparkles className="h-3 w-3" />
                Widget
              </span>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t.documentation.sections.newsletterWidget.description}
              </p>
              <div className="space-y-2">
                <StepRow index={1} text={t.documentation.sections.newsletterWidget.steps.step1} />
                <StepRow index={2} text={t.documentation.sections.newsletterWidget.steps.step2} />
                <StepRow index={3} text={t.documentation.sections.newsletterWidget.steps.step3} />
                <StepRow index={4} text={t.documentation.sections.newsletterWidget.steps.step4} />
              </div>
              <div className="rounded-xl border border-[#E8ECEF] bg-[#1D141F] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Code className="h-3.5 w-3.5 text-[#E2F343]" />
                  <span className="text-xs font-semibold text-[#E2F343] uppercase tracking-wide">
                    {t.documentation.sections.newsletterWidget.codeExample}
                  </span>
                </div>
                <pre className="text-[13px] font-mono text-[#E8ECEF] leading-relaxed overflow-x-auto">
                  {'<script\n  src="https://api.votredomaine.com/api/widgets/subscribe?token=xxx"\n  async\n></script>'}
                </pre>
                <p className="mt-3 text-xs text-[#8B939E]">
                  {t.documentation.sections.newsletterWidget.supportedPlatforms}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Fonctionnalités */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Canaux */}
            <FeatureCard
              index={0.1}
              icon={<Radio className="h-4 w-4" />}
              iconBg="bg-[oklch(0.55_0.18_250/0.1)]"
              iconColor="text-[oklch(0.55_0.18_250)]"
              title={t.documentation.sections.channels.title}
              description={t.documentation.sections.channels.description}
              items={[
                { icon: <Mail className="h-3.5 w-3.5" />, text: t.documentation.sections.channels.features.feature1 },
                { icon: <Globe className="h-3.5 w-3.5" />, text: t.documentation.sections.channels.features.feature2 },
                { icon: <Users className="h-3.5 w-3.5" />, text: t.documentation.sections.channels.features.feature3 },
                { icon: <MapPin className="h-3.5 w-3.5" />, text: t.documentation.sections.channels.features.feature4 },
              ]}
            />

            {/* Tracking */}
            <FeatureCard
              index={0.15}
              icon={<BarChart3 className="h-4 w-4" />}
              iconBg="bg-[#E2F343]/20"
              iconColor="text-[#1D141F]"
              title={t.documentation.sections.tracking.title}
              description={t.documentation.sections.tracking.description}
              items={[
                { icon: <MousePointerClick className="h-3.5 w-3.5" />, text: t.documentation.sections.tracking.features.feature1 },
                { icon: <MousePointerClick className="h-3.5 w-3.5" />, text: t.documentation.sections.tracking.features.feature2 },
                { icon: <MapPin className="h-3.5 w-3.5" />, text: t.documentation.sections.tracking.features.feature3 },
                { icon: <Clock className="h-3.5 w-3.5" />, text: t.documentation.sections.tracking.features.feature4 },
              ]}
            />

            {/* Templates */}
            <FeatureCard
              index={0.2}
              icon={<LayoutTemplate className="h-4 w-4" />}
              iconBg="bg-[#D95800]/10"
              iconColor="text-[#D95800]"
              title={t.documentation.sections.templates.title}
              description={t.documentation.sections.templates.description}
              items={[
                { icon: <BookOpen className="h-3.5 w-3.5" />, text: t.documentation.sections.templates.features.feature1 },
                { icon: <BookOpen className="h-3.5 w-3.5" />, text: t.documentation.sections.templates.features.feature2 },
                { icon: <BookOpen className="h-3.5 w-3.5" />, text: t.documentation.sections.templates.features.feature3 },
              ]}
            />

            {/* Sécurité */}
            <FeatureCard
              index={0.25}
              icon={<Shield className="h-4 w-4" />}
              iconBg="bg-emerald-500/10"
              iconColor="text-emerald-600"
              title={t.documentation.sections.security.title}
              description={t.documentation.sections.security.description}
              items={[
                { icon: <Unlock className="h-3.5 w-3.5" />, text: t.documentation.sections.security.features.feature1 },
                { icon: <Clock className="h-3.5 w-3.5" />, text: t.documentation.sections.security.features.feature2 },
                { icon: <Shield className="h-3.5 w-3.5" />, text: t.documentation.sections.security.features.feature3 },
                { icon: <Building2 className="h-3.5 w-3.5" />, text: t.documentation.sections.security.features.feature4 },
              ]}
            />
          </div>
        </div>
      </ViewTabPanel>
    </ViewShell>
  );
}

function StepRow({ index, text }: { index: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <StepDot index={index} />
      <span className="text-sm text-[#1D141F] leading-relaxed pt-0.5">{text}</span>
    </div>
  );
}

function FeatureCard({
  index,
  icon,
  iconBg,
  iconColor,
  title,
  description,
  items,
}: {
  index: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  items: { icon: React.ReactNode; text: string }[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index }}
      className="rounded-xl border border-[#E8ECEF] bg-white shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-3 border-b border-[#E8ECEF] bg-[#FAFBFC] px-5 py-3.5">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', iconBg)}>
          <span className={iconColor}>{icon}</span>
        </div>
        <h3 className="text-sm font-semibold text-[#1D141F]">{title}</h3>
      </div>
      <div className="p-5 space-y-3">
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>
        <div className="space-y-2">
          {items.map((item, i) => (
            <FeatureChip key={i} icon={item.icon} text={item.text} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
