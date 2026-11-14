export function Toast({ message }: {
  message: string
}) {
  return message ? <div className="toast-host">
    <div className={message.startsWith('Could not') ? 'toast toast--over' : 'toast'}
      role="status">{message}</div>
  </div> : null;
}
