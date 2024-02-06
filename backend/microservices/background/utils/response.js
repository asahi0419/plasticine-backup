export default (res, service, status, lastActiveTime, timeDifference, statusCode) => {
  return res.status(statusCode).json({
    service,
    service_status: status,
    last_active_time: `${Math.round(lastActiveTime)}s ago`,
    max_allowed_down_time: `${timeDifference}s`,
  });
};