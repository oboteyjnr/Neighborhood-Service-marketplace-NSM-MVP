const USER_ROLES = {
  RESIDENT: "resident",
  PROVIDER: "provider"
};

const REQUEST_STATUS = {
  OPEN: "open",
  QUOTED: "quoted",
  ASSIGNED: "assigned",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
};

const QUOTE_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected"
};

module.exports = {
  USER_ROLES,
  REQUEST_STATUS,
  QUOTE_STATUS
};
