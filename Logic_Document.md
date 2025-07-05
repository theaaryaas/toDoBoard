# Logic Document: Collaborative Todo Board

## Smart Assign Implementation

### Overview
The Smart Assign feature automatically distributes tasks among team members by assigning them to users with the fewest active tasks. This ensures fair workload distribution and prevents any single user from being overwhelmed.

### Algorithm Details

#### 1. Task Count Calculation
```javascript
// For each user, count tasks in "Todo" or "In Progress" status
const activeTaskCount = await Task.countDocuments({
  assignedTo: user._id,
  status: { $in: ['Todo', 'In Progress'] }
});
```

#### 2. User Selection Logic
- **Iteration**: Loop through all registered users
- **Counting**: Count active tasks (Todo + In Progress) for each user
- **Comparison**: Track the user with the minimum task count
- **Selection**: Choose the user with the lowest count

#### 3. Implementation Steps
1. **Fetch All Users**: Retrieve all registered users from the database
2. **Calculate Workload**: For each user, count their active tasks
3. **Find Minimum**: Identify the user with the fewest active tasks
4. **Assign Task**: Automatically assign the task to the selected user
5. **Real-time Update**: Broadcast the assignment to all connected users

#### 4. Edge Cases Handled
- **No Users**: Returns error if no users are available
- **Equal Counts**: If multiple users have the same minimum count, the first one found is selected
- **Unassigned Tasks**: Only considers tasks that are actually assigned to users

### Benefits
- **Fair Distribution**: Prevents workload imbalance
- **Automatic**: No manual intervention required
- **Real-time**: Immediate assignment and notification
- **Scalable**: Works with any number of users

---

## Conflict Resolution Implementation

### Overview
The conflict resolution system handles simultaneous edits to the same task by detecting version mismatches and providing users with options to resolve conflicts.

### Conflict Detection

#### 1. Version Tracking
```javascript
// Each task has a version number that increments on every update
taskSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.version += 1;
    this.lastModifiedAt = new Date();
  }
  next();
});
```

#### 2. Conflict Detection Logic
```javascript
// Compare client version with server version
if (version && task.version !== version) {
  return {
    conflict: true,
    serverVersion: task,
    clientVersion: req.body
  };
}
```

### Resolution Strategies

#### 1. Merge Resolution
- **Purpose**: Combine changes from both versions
- **Process**: 
  - Take the client's changes as the base
  - Preserve server changes that don't conflict
  - Increment version number
  - Update last modified timestamp
- **Use Case**: When both users made different changes to different fields

#### 2. Overwrite Resolution
- **Purpose**: Choose one version to keep
- **Process**:
  - Completely replace server version with chosen version
  - Increment version number
  - Update last modified timestamp
- **Use Case**: When users want to keep one specific version

### Implementation Flow

#### 1. Edit Attempt
1. User attempts to edit a task
2. Client sends current version number with the update
3. Server receives the request

#### 2. Conflict Detection
1. Server compares client version with current server version
2. If versions don't match, conflict is detected
3. Server returns both versions to the client

#### 3. Conflict Notification
1. Client receives conflict data
2. Conflict resolution modal is displayed
3. Both users are notified via real-time updates

#### 4. Resolution Process
1. User chooses resolution strategy (Merge/Overwrite)
2. User selects which version to keep
3. Resolution request is sent to server
4. Server applies the resolution
5. Updated task is broadcast to all users

### Real-time Conflict Handling

#### 1. Socket.IO Integration
```javascript
// Emit conflict to all connected users
io.emit('conflictDetected', {
  serverVersion: task,
  clientVersion: req.body,
  taskId: id
});
```

#### 2. Client-side Handling
```javascript
// Listen for conflict events
socket.on('conflictDetected', (data) => {
  setConflictData(data);
  showConflictModal();
});
```

### Conflict Resolution UI

#### 1. Modal Display
- Shows both versions side by side
- Highlights differences between versions
- Provides clear action buttons (Merge/Overwrite)

#### 2. User Experience
- **Clear Information**: Users can see exactly what changed
- **Easy Choice**: Simple buttons for resolution
- **No Data Loss**: All changes are preserved until resolution

### Benefits of This Approach

#### 1. Data Integrity
- **No Silent Overwrites**: Users are always aware of conflicts
- **Version Control**: Every change is tracked
- **Audit Trail**: All conflicts and resolutions are logged

#### 2. User Experience
- **Transparent**: Users see exactly what happened
- **Flexible**: Multiple resolution options available
- **Real-time**: Immediate conflict detection and resolution

#### 3. Scalability
- **Efficient**: Only conflicts are broadcast
- **Lightweight**: Minimal overhead for normal operations
- **Reliable**: Works with any number of concurrent users

### Example Scenarios

#### Scenario 1: Title Conflict
- **User A**: Changes title to "Fix Login Bug"
- **User B**: Changes title to "Resolve Authentication Issue"
- **Resolution**: User chooses to keep one title or merge them

#### Scenario 2: Different Fields
- **User A**: Changes description
- **User B**: Changes priority
- **Resolution**: Merge resolution combines both changes

#### Scenario 3: Complex Conflict
- **User A**: Changes title and description
- **User B**: Changes title and priority
- **Resolution**: User can choose which version to keep or merge specific fields

### Technical Considerations

#### 1. Performance
- **Minimal Overhead**: Version checking is fast
- **Efficient Broadcasting**: Only conflicts trigger broadcasts
- **Optimized Queries**: Indexed version fields

#### 2. Reliability
- **Atomic Operations**: Version updates are atomic
- **Error Handling**: Graceful handling of resolution failures
- **Fallback Mechanisms**: Default behavior if resolution fails

#### 3. Security
- **Validation**: All resolved data is validated
- **Authorization**: Only authorized users can resolve conflicts
- **Audit Logging**: All conflict resolutions are logged

This implementation ensures that collaborative editing is both powerful and reliable, providing users with the tools they need to work together effectively while maintaining data integrity and providing a smooth user experience. 