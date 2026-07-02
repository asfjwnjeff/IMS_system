// 详情/编辑页段落标题 — 蓝色左边框 + 标题
// 替代 Ant Design 的 Card title 样式
export function SectionHead({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="block w-[3px] h-4 rounded-sm shrink-0" style={{ backgroundColor: 'var(--blue)' }} />
      <span className="text-sm font-semibold text-primary">{title}</span>
    </div>
  );
}
