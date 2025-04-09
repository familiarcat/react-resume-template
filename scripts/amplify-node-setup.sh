#!/bin/bash
set -e

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

REQUIRED_NODE_VERSION="18.19.0"
REQUIRED_NPM_VERSION="9.8.1"

# Function to compare versions
version_compare() {
    if [[ $1 == $2 ]]; then
        return 0
    fi
    local IFS=.
    local i ver1=($1) ver2=($2)
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++)); do
        ver1[i]=0
    done
    for ((i=0; i<${#ver1[@]}; i++)); do
        if [[ -z ${ver2[i]} ]]; then
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]})); then
            return 1
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]})); then
            return 2
        fi
    done
    return 0
}

# Function to extract version number without 'v' prefix
clean_version() {
    echo "${1#v}"
}

# Function to verify Node.js installation
verify_node() {
    if ! command -v node &> /dev/null; then
        return 1
    fi
    local current_version=$(clean_version "$(node --version)")
    local required_version=$(clean_version "$REQUIRED_NODE_VERSION")
    version_compare "$current_version" "$required_version"
    return $?
}

# Function to verify npm installation
verify_npm() {
    if ! command -v npm &> /dev/null; then
        return 1
    fi
    local current_version=$(clean_version "$(npm --version)")
    local required_version=$(clean_version "$REQUIRED_NPM_VERSION")
    version_compare "$current_version" "$required_version"
    return $?
}

# Function to install Node.js using n
install_with_n() {
    log "Installing n..."
    curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n
    bash n "$REQUIRED_NODE_VERSION"
    rm n
    # Refresh PATH
    export PATH="/usr/local/bin:$PATH"
}

# Function to install Node.js using NodeSource
install_with_nodesource() {
    log "Installing Node.js from NodeSource..."
    if command -v apt-get &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif command -v yum &> /dev/null; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo -E bash -
        sudo yum install -y nodejs
    else
        return 1
    fi
}

main() {
    log "Starting Node.js setup..."
    log "Required Node.js version: $REQUIRED_NODE_VERSION"
    log "Required npm version: $REQUIRED_NPM_VERSION"

    # Check current versions
    if command -v node &> /dev/null; then
        log "Current Node.js version: $(node --version)"
    fi
    if command -v npm &> /dev/null; then
        log "Current npm version: $(npm --version)"
    fi

    # Try to use nvm if available
    if [ -f "$HOME/.nvm/nvm.sh" ]; then
        log "Using nvm..."
        export NVM_DIR="$HOME/.nvm"
        . "$NVM_DIR/nvm.sh"
        nvm install "$REQUIRED_NODE_VERSION"
        nvm use "$REQUIRED_NODE_VERSION"
    # Try to use n
    elif command -v curl &> /dev/null; then
        log "Attempting installation with n..."
        install_with_n
    # Try NodeSource
    else
        log "Attempting installation with NodeSource..."
        install_with_nodesource
    fi

    # Verify installation
    if ! verify_node; then
        log "ERROR: Failed to install required Node.js version"
        exit 1
    fi

    if ! verify_npm; then
        log "ERROR: Failed to install required npm version"
        exit 1
    fi

    log "Node.js setup completed successfully"
    log "Node.js version: $(node --version)"
    log "npm version: $(npm --version)"
}

main
