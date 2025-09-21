import React from 'react';
import { Menu, Checkbox } from 'antd';

const ColumnVisibility = ({ columns, visibleColumns, onChange }) => {
  return (
    <Menu>
      {columns.map(col => {
        const key = col.dataIndex || col.key;
        return (
          <Menu.Item key={key}>
            <Checkbox
              checked={visibleColumns.includes(key)}
              onChange={e => {
                const checked = e.target.checked;
                if (checked) {
                  onChange([...visibleColumns, key]);
                } else {
                  onChange(visibleColumns.filter(c => c !== key));
                }
              }}
            >
              {col.title}
            </Checkbox>
          </Menu.Item>
        );
      })}
    </Menu>
  );
};

export default ColumnVisibility;