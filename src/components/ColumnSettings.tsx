import { Popover, Button, Checkbox, message, Tooltip } from 'antd';
import { SettingOutlined, UpOutlined, DownOutlined, MenuOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import type { FieldConfig } from '../hooks/usePersistedConfig';

interface ColumnSettingsProps {
  fields: FieldConfig[];
  labelMap: Record<string, string>;
  onToggle: (key: string) => void;
  onReorder: (from: number, to: number) => void;
  onReset: () => void;
}

export default function ColumnSettings({ fields, labelMap, onToggle, onReorder, onReset }: ColumnSettingsProps) {
  const sorted = [...fields].sort((a, b) => a.order - b.order);

  const moveUp = (index: number) => {
    if (index === 0) return;
    onReorder(index, index - 1);
  };

  const moveDown = (index: number) => {
    if (index === sorted.length - 1) return;
    onReorder(index, index + 1);
  };

  const moveToTop = (index: number) => {
    if (index === 0) return;
    onReorder(index, 0);
    message.success('已置顶');
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = Number(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex);
    }
  };

  const content = (
    <div style={{ width: 320, maxHeight: 480, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#262626' }}>自定义列显示</div>
      <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 12 }}>
        <MenuOutlined /> 拖拽排序 · 勾选显示 · <UpOutlined />/<DownOutlined /> 微调 · <VerticalAlignTopOutlined /> 置顶
      </div>
      <div style={{ overflowY: 'auto', flex: 1, maxHeight: 340 }}>
        {sorted.map((f, i) => (
          <div
            key={f.key}
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 6px',
              borderRadius: 4,
              marginBottom: 2,
              background: f.visible ? '#e6f4ff' : '#fff',
              cursor: 'grab',
              border: f.visible ? '1px solid #bae0ff' : '1px solid transparent',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              if (!f.visible) el.style.background = '#fafafa';
              el.style.borderColor = '#d9d9d9';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = f.visible ? '#e6f4ff' : '#fff';
              el.style.borderColor = f.visible ? '#bae0ff' : 'transparent';
            }}
          >
            <MenuOutlined style={{ color: '#bfbfbf', fontSize: 12, flexShrink: 0 }} />
            <Checkbox
              checked={f.visible}
              onChange={() => onToggle(f.key)}
              style={{ flex: 1, fontSize: 13, marginRight: 4 }}
            >
              {labelMap[f.key] || f.key}
            </Checkbox>
            <Tooltip title="置顶">
              <Button
                type="text" size="small"
                icon={<VerticalAlignTopOutlined style={{ fontSize: 11 }} />}
                disabled={i === 0}
                onClick={(e) => { e.stopPropagation(); moveToTop(i); }}
                style={{ padding: '0 2px', height: 22, minWidth: 22, flexShrink: 0 }}
              />
            </Tooltip>
            <Tooltip title="上移">
              <Button
                type="text" size="small"
                icon={<UpOutlined style={{ fontSize: 10 }} />}
                disabled={i === 0}
                onClick={(e) => { e.stopPropagation(); moveUp(i); }}
                style={{ padding: '0 2px', height: 22, minWidth: 22, flexShrink: 0 }}
              />
            </Tooltip>
            <Tooltip title="下移">
              <Button
                type="text" size="small"
                icon={<DownOutlined style={{ fontSize: 10 }} />}
                disabled={i === sorted.length - 1}
                onClick={(e) => { e.stopPropagation(); moveDown(i); }}
                style={{ padding: '0 2px', height: 22, minWidth: 22, flexShrink: 0 }}
              />
            </Tooltip>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8, marginTop: 4 }}>
        <Button size="small" block onClick={onReset}>恢复默认</Button>
      </div>
    </div>
  );

  return (
    <Popover content={content} trigger="click" placement="bottomRight" overlayStyle={{ padding: 0 }}>
      <Button icon={<SettingOutlined />}>列设置</Button>
    </Popover>
  );
}
