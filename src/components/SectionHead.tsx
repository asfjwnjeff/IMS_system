/** 段落标题（详情/编辑页共用） */
export default function SectionHead({ title }: { title: string }) {
  return (
    <div className="section-head">
      <span className="section-head-line" />
      <span className="section-head-title">{title}</span>
    </div>
  );
}
