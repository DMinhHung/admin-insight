import React, { useState } from "react";
import { Card, Modal, Select, Typography, Row, Col, Space } from "antd";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

const shifts = ["Sáng", "Chiều", "Tối"];
const employees = ["Nguyên Văn A", "Phan Thị B", "Trần Văn C", "Lê Thị D"];

const EmployeeSchedule = () => {
  const today = dayjs();

  const startOfCurrentWeek = today.startOf("week").add(1, "day");
  const weeks = [
    startOfCurrentWeek.subtract(7, "day"),
    startOfCurrentWeek,
    startOfCurrentWeek.add(7, "day")
  ];

  const [schedule, setSchedule] = useState(
    weeks.map(weekStart => Array(7).fill([]))
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedShift, setSelectedShift] = useState("");

  const handleDayClick = (weekIdx, dayIdx, dayDate) => {
    if (dayDate.isBefore(today, "day")) return;
    setSelectedWeekIndex(weekIdx);
    setSelectedDayIndex(dayIdx);
    setSelectedEmployee("");
    setSelectedShift("");
    setModalVisible(true);
  };

  const handleAddShift = () => {
    if (!selectedEmployee || !selectedShift) return;
    setSchedule(prev => {
      const newSchedule = [...prev];
      newSchedule[selectedWeekIndex][selectedDayIndex] = [
        ...newSchedule[selectedWeekIndex][selectedDayIndex],
        { employee: selectedEmployee, shift: selectedShift }
      ];
      return newSchedule;
    });
    setModalVisible(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>📅 Lịch làm việc</Title>

      {weeks.map((weekStart, weekIdx) => (
        <div key={weekIdx} style={{ marginBottom: 24 }}>
          <Title level={5}>Tuần {weekIdx === 0 ? "Trước" : weekIdx === 1 ? "Hiện tại" : "Sau"}</Title>
          <Row gutter={[12, 12]}>
            {Array(7).fill(0).map((_, dayIdx) => {
              const dayDate = weekStart.add(dayIdx, "day");
              const isPast = dayDate.isBefore(today, "day");
              return (
                <Col key={dayIdx} style={{ flex: 1 }}>
                  <Card
                    hoverable={!isPast}
                    style={{
                      minHeight: 100,
                      borderRadius: 10,
                      backgroundColor: isPast ? "#e0e0e0" : "#fff",
                      cursor: isPast ? "not-allowed" : "pointer"
                    }}
                    onClick={() => handleDayClick(weekIdx, dayIdx, dayDate)}
                  >
                    <div style={{ fontWeight: "bold", textAlign: "center", marginBottom: 4 }}>
                      {dayDate.format("dd")}<br />
                      {dayDate.format("DD/MM")}
                    </div>
                    <Space direction="vertical" size={2}>
                      {schedule[weekIdx][dayIdx].map((item, i) => (
                        <div key={i} style={{ padding: 2, backgroundColor: "#f0f0f0", borderRadius: 4, fontSize: 12 }}>
                          {item.employee} - {item.shift}
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Col>
              )
            })}
          </Row>
        </div>
      ))}

      <Modal
        title="Thêm ca làm việc"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleAddShift}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Select
            placeholder="Chọn nhân viên"
            value={selectedEmployee}
            onChange={value => setSelectedEmployee(value)}
            style={{ width: "100%" }}
          >
            {employees.map(emp => <Option key={emp} value={emp}>{emp}</Option>)}
          </Select>

          <Select
            placeholder="Chọn ca"
            value={selectedShift}
            onChange={value => setSelectedShift(value)}
            style={{ width: "100%" }}
          >
            {shifts.map(shift => <Option key={shift} value={shift}>{shift}</Option>)}
          </Select>
        </Space>
      </Modal>
    </div>
  )
};

export default EmployeeSchedule;
