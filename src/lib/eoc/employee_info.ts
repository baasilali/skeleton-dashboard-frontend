export type EmployeeInfo = {
    name: string;
    email: string;
    commission: number;
};

export const closerInfoMap: Record<string, EmployeeInfo> = {
    Alan: {
      name: "Alan",
      email: "alan@dashboard.com",
      commission: 0.1,
    },
    John: {
      name: "John",
      email: "john@dashboard.com",
      commission: 0.1,
    },
    Mike: {
      name: "Mike",
      email: "mike@dashboard.com",
      commission: 0.1,
    },
};

export const setterInfoMap: Record<string, EmployeeInfo> = {
    Jack: {
      name: "Jack",
      email: "jack@dashboard.com",
      commission: 0.05,
    },
    Mark: {
      name: "Mark",
      email: "mark@dashboard.com",
      commission: 0.05,
    },
    Tyler: {
      name: "Tyler",
      email: "tyler@dashboard.com",
      commission: 0.05,
    },
};

export const coachInfoMap: Record<string, EmployeeInfo> = {
    Cody: {
      name: "Cody",
      email: "cody@dashboard.com",
      commission: 0.3,
    },
    James: {
      name: "James",
      email: "james@dashboard.com",
      commission: 0.3,
    }
};