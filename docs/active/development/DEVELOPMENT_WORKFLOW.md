# Development Workflow Guide

## Process Management

### Automatic Cleanup
We have a cleanup script to prevent development servers from piling up in the background:

```bash
# Clean up all development servers
npm run cleanup
# or
npm run kill-servers
# or
./scripts/cleanup-dev-servers.sh
```

### Manual Cleanup Commands
If you need to manually clean up processes:

```bash
# Kill npm start processes
pkill -f "npm start"

# Kill expo start processes  
pkill -f "expo start"

# Kill node expo processes
pkill -f "node.*expo"

# Kill jest-worker processes
pkill -f "jest-worker"

# Check for remaining processes
ps aux | grep -E "(expo|npm)" | grep -v grep
```

## Development Workflow

### Before Starting Development
1. **Always clean up first**:
   ```bash
   npm run cleanup
   ```

2. **Check RAM usage**:
   ```bash
   free -h
   ```

### Starting Development Server
```bash
npm start
```

### When Testing Code Changes
1. **Start server**: `npm start`
2. **Test changes** in the app
3. **Stop server**: `Ctrl+C` in terminal
4. **Clean up**: `npm run cleanup` (if terminal was closed)

### Before Committing Code
1. **Stop all servers**: `npm run cleanup`
2. **Check for zombie processes**: `ps aux | grep -E "(expo|npm)"`
3. **Verify RAM is freed**: `free -h`

## Common Issues

### High RAM Usage
If you notice high RAM usage:
1. Run cleanup: `npm run cleanup`
2. Check processes: `ps aux | grep -E "(expo|npm)"`
3. Kill manually if needed: `pkill -f "npm start"`

### Port Already in Use
If you get "Port 8081 is running" error:
1. Clean up: `npm run cleanup`
2. Wait a few seconds
3. Try again: `npm start`

### Multiple Instances
If you see multiple npm/expo processes:
1. This usually means terminals were closed without proper cleanup
2. Run: `npm run cleanup`
3. Start fresh: `npm start`

## Best Practices

1. **Always use Ctrl+C** to stop development servers properly
2. **Run cleanup before starting** a new development session
3. **Check RAM usage** if your system feels slow
4. **Don't close terminals** while servers are running (use Ctrl+C first)
5. **Use the cleanup script** regularly to prevent process buildup

## Monitoring

### Check Running Processes
```bash
ps aux | grep -E "(expo|npm)" | grep -v grep
```

### Check RAM Usage
```bash
free -h
```

### Check Port Usage
```bash
lsof -i :8081
lsof -i :8082
```

## Troubleshooting

### If Cleanup Script Doesn't Work
1. Check script permissions: `ls -la scripts/cleanup-dev-servers.sh`
2. Make executable: `chmod +x scripts/cleanup-dev-servers.sh`
3. Run manually: `./scripts/cleanup-dev-servers.sh`

### If Processes Still Running
1. Find process IDs: `ps aux | grep -E "(expo|npm)"`
2. Kill by PID: `kill -9 <PID>`
3. Force kill all: `pkill -9 -f "npm start"`

### If RAM Still High
1. Check for other processes: `top` or `htop`
2. Restart your system if needed
3. Check for memory leaks in your code
