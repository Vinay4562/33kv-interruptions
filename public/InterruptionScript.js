document.addEventListener('DOMContentLoaded', function () {
    const substations = [
        { name: "220/132/33KV Tandur", subSubstations: ["33KV Basheerabad", "33KV Karankote", "33KV Tandur", "33KV Turmamidi", "33kv Yalal", "33KV Bommarspet", "33KV Peddamul", "33KV Gouthapur", "33KV Mythra Solar", "33KV Vikarabad"] },
        { name: "220KV SS Chandanavally", subSubstations: ["33KV WAMIL", "33KV WFL", "33KV Chandanvally IP"] },
        { name: "132/33KV Kodangal", subSubstations: ["33KV Dudyal", "33KV Kodangal", "33KV Peddanandigama", "33KV Hamshanpally", "33KV Kothur", "33KV Usha solar", "33KV Winsol Solar"] },
        { name: "132/33KV Kanakamamidi", subSubstations: ["33KV Kethireddypally", "33KV Kanakamamidi", "33KV CHANDANVELLY-2", "33KV CHANDANVELLY-1", "33KV Moinabad", "33KV Reddypally"] },
        { name: "132/33KVSS Parigi", subSubstations: ["33KV Rapol", "33KV Manneguda", "33KV Siddulur", "33KV Water Grid", "33KV Divya shakthy Paper Mills", "33KV Savitri-1(12-1-2010)", "33KV Pargi ( 15-10-12)", "33KV Abhiram Steel (29-10-12)", "33KV Savitri-2 (25-2-14)", "33KV Rangampally", "33 KV Poodur", "SSJ Solar Plant(1-11-2014)", "Globle Solar Plant(23-3-2016)"] },
        { name: "132/33KVSS Puttapahad", subSubstations: ["33KV Puttapahad", "33KV Chowdapur", "33KV Mothkur", "33KV Nancharla", "33KV DOMA", "33Kv Salkarpet"] },
        { name: "132/33KVSS  SRIRANGAPUR", subSubstations: ["33KV Uttharas pally", "33KV kondurg", "33KV chowdari gudem", "33kv mogili gidda", "33kv antharam", "33kv amazon", "33kv vijaya neha", "33KV binju saraya"] },
        { name: "132/33KVSS  Vikarabad", subSubstations: ["33kv siddulur", "33KV mmepl solar KOTTAGADI", "33KV mmepl solar PEERAMPALLY", "33KV MADANA PALLY", "33KV MADANA PALLY", "33 KV VIKARABAD"] },
        { name: "132/33KV Donthanpally", subSubstations: ["33KV IBS", "33KV GARGI STEELS", "33KV PRAGATHI", "33KV NANAKRAMGUDA", "33KV VATTINAGULAPALLY", "33KV NARSINGHI", "33KV CBIT", "33KV SHANKARPALLY", "33 KV MEDHA SERVO", "33kV SIFY"] }
    ];

    let highestSerialNumber = 0;
    let editingId = null; // Variable to keep track of which record is being edited
    let currentSubstation = null; // Variable to store the current substation name

    function getSubstationData(name) {
        return substations.find(substation => substation.name === name);
    }

    function populateDropdowns() {
        const substationDropdown = document.getElementById('substation-dropdown');
        const subSubstationSelect = document.getElementById('sub-substation-select');

        const query = new URLSearchParams(window.location.search);
        const substationName = query.get('substation');

        if (substationName) {
            currentSubstation = substationName;
            const substation = getSubstationData(substationName);

            if (substation) {
                substationDropdown.innerHTML = `<option value="${substation.name}" selected>${substation.name}</option>`;
                populateSubSubstationDropdown(substation.subSubstations);
            }
        } else {
            substationDropdown.innerHTML = '<option value="" disabled selected>Select a substation</option>';
            substations.forEach(substation => {
                const option = document.createElement('option');
                option.value = substation.name;
                option.textContent = substation.name;
                substationDropdown.appendChild(option);
            });

            if (currentSubstation) {
                substationDropdown.value = currentSubstation;
                populateSubSubstationDropdown(getSubstationData(currentSubstation).subSubstations);
            }
        }
    }

    function populateSubSubstationDropdown(feeders) {
        const subSubstationSelect = document.getElementById('sub-substation-select');
        subSubstationSelect.innerHTML = '<option value="" disabled selected>Select Feeder</option>';

        feeders.forEach(feeder => {
            const option = document.createElement('option');
            option.value = feeder;
            option.textContent = feeder;
            subSubstationSelect.appendChild(option);
        });
    }

    function calculateDuration() {
        const fromDatetime = document.getElementById('from-datetime');
        const toDatetime = document.getElementById('to-datetime');
        const durationInput = document.getElementById('duration-input');

        function formatDuration(seconds) {
            // Calculate hours, minutes, and seconds
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;

            // Format hours, minutes, and seconds to be two digits
            const formattedHours = String(hours).padStart(2, '0');
            const formattedMinutes = String(minutes).padStart(2, '0');
            const formattedSeconds = String(secs).padStart(2, '0');

            // Return formatted time
            return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        }

        function updateDuration() {
            const from = new Date(fromDatetime.value);
            const to = new Date(toDatetime.value);

            if (from && to && to >= from) {
                const durationMs = to - from;
                const durationSeconds = Math.floor(durationMs / 1000);

                durationInput.value = formatDuration(durationSeconds);
            } else {
                durationInput.value = '';
            }
        }

        fromDatetime.addEventListener('change', updateDuration);
        toDatetime.addEventListener('change', updateDuration);
    }


    async function fetchInterruptions() {
        try {
            const response = await fetch('/api/interruptions');
            const interruptions = await response.json();
            const tableBody = document.getElementById('interruption-table').getElementsByTagName('tbody')[0];

            interruptions.forEach(interruption => {
                if (interruption.substationName === currentSubstation) { // Display only for current substation
                    const newRow = tableBody.insertRow();
                    newRow.setAttribute('data-serial', ++highestSerialNumber);
                    newRow.insertCell().textContent = highestSerialNumber;
                    newRow.insertCell().textContent = interruption.substationName;
                    newRow.insertCell().textContent = interruption.feederName;
                    newRow.insertCell().textContent = interruption.cause;
                    newRow.insertCell().textContent = new Date(interruption.fromDatetime).toLocaleString();
                    newRow.insertCell().textContent = new Date(interruption.toDatetime).toLocaleString();
                    newRow.insertCell().textContent = interruption.duration;

                    const actionsCell = newRow.insertCell();
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Edit';
                    editButton.className = 'button-edit'; // Add class for styling
                    editButton.addEventListener('click', () => handleEdit(newRow, interruption._id));
                    actionsCell.appendChild(editButton);

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.className = 'button-delete'; // Add class for styling
                    deleteButton.addEventListener('click', () => handleDelete(newRow, interruption._id));
                    actionsCell.appendChild(deleteButton);
                }
            });
        } catch (error) {
            console.error('Error fetching interruptions:', error);
        }
    }

    function handleFormSubmit(event) {
        event.preventDefault();

        calculateDuration(); // Ensure duration is updated before submission

        const substationName = document.getElementById('substation-dropdown').value;
        const feederName = document.getElementById('sub-substation-select').value;
        const cause = document.getElementById('cause-input').value;
        const fromDatetime = document.getElementById('from-datetime').value;
        const toDatetime = document.getElementById('to-datetime').value;
        const duration = document.getElementById('duration-input').value;

        const interruptionData = {
            substationName,
            feederName,
            cause,
            fromDatetime,
            toDatetime,
            duration
        };

        const showPopup = () => {
            const popup = document.getElementById('success-popup');
            popup.classList.remove('hidden');
            popup.classList.add('visible');

            setTimeout(() => {
                popup.classList.remove('visible');
                popup.classList.add('hidden');
            }, 1500); // Show for 1.5 seconds
        };

        if (editingId) {
            // Update existing interruption
            fetch(`/api/interruptions/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(interruptionData)
            })
            .then(response => response.json())
            .then(updatedInterruption => {
                const tableBody = document.getElementById('interruption-table').getElementsByTagName('tbody')[0];
                const rows = tableBody.getElementsByTagName('tr');

                for (const row of rows) {
                    if (row.getAttribute('data-serial') == highestSerialNumber) {
                        row.cells[1].textContent = updatedInterruption.substationName;
                        row.cells[2].textContent = updatedInterruption.feederName;
                        row.cells[3].textContent = updatedInterruption.cause;
                        row.cells[4].textContent = new Date(updatedInterruption.fromDatetime).toLocaleString();
                        row.cells[5].textContent = new Date(updatedInterruption.toDatetime).toLocaleString();
                        row.cells[6].textContent = updatedInterruption.duration;
                        break;
                    }
                }

                document.getElementById('interruption-form').reset();
                editingId = null; // Reset editingId after successful update
                populateDropdowns(); // Repopulate dropdowns after reset
                showPopup(); // Show success popup
            })
            .catch(error => console.error('Error updating interruption:', error));
        } else {
            // Add new interruption
            fetch('/api/interruptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(interruptionData)
            })
            .then(response => response.json())
            .then(data => {
                const tableBody = document.getElementById('interruption-table').getElementsByTagName('tbody')[0];
                const newRow = tableBody.insertRow();
                newRow.setAttribute('data-serial', ++highestSerialNumber);
                newRow.insertCell().textContent = highestSerialNumber;
                newRow.insertCell().textContent = data.substationName;
                newRow.insertCell().textContent = data.feederName;
                newRow.insertCell().textContent = data.cause;
                newRow.insertCell().textContent = new Date(data.fromDatetime).toLocaleString();
                newRow.insertCell().textContent = new Date(data.toDatetime).toLocaleString();
                newRow.insertCell().textContent = data.duration;

                const actionsCell = newRow.insertCell();

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.className = 'button-edit'; // Add class for styling
                editButton.addEventListener('click', () => handleEdit(newRow, data._id));
                actionsCell.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'button-delete'; // Add class for styling
                deleteButton.addEventListener('click', () => handleDelete(newRow, data._id));
                actionsCell.appendChild(deleteButton);


                document.getElementById('interruption-form').reset();
                populateDropdowns(); // Repopulate dropdowns after reset
                showPopup(); // Show success popup
            })
            .catch(error => console.error('Error submitting interruption:', error));
        }
    }

    function handleEdit(row, id) {
        editingId = id;
        const cells = row.getElementsByTagName('td');
        document.getElementById('substation-dropdown').value = cells[1].textContent;
        document.getElementById('sub-substation-select').value = cells[2].textContent;
        document.getElementById('cause-input').value = cells[3].textContent;
        document.getElementById('from-datetime').value = cells[4].textContent;
        document.getElementById('to-datetime').value = cells[5].textContent;
        document.getElementById('duration-input').value = cells[6].textContent;

        row.parentNode.removeChild(row); // Remove row from table after clicking edit
    }

    function handleDelete(row, id) {
        if (confirm('Are you sure you want to delete this interruption?')) {
            fetch(`/api/interruptions/${id}`, {
                method: 'DELETE'
            })
            .then(() => {
                row.remove();
            })
            .catch(error => console.error('Error deleting interruption:', error));
        }
    }

    document.getElementById('interruption-form').addEventListener('submit', handleFormSubmit);
    populateDropdowns();
    fetchInterruptions();
    calculateDuration();
});

document.addEventListener('DOMContentLoaded', function () {
    // Function to handle user logout
    function handleLogout() {
        // Ask for user confirmation
        const confirmLogout = confirm('Are you sure you want to logout?');
        
        if (confirmLogout) {
            fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    // Remove substationName from session storage
                    sessionStorage.removeItem('substationName');

                    // Notify user and redirect
                    alert('Logout successful!');
                    history.replaceState(null, null, '/login.html');
                    window.location.replace('/login.html'); // Redirect to login page or home page
                } else {
                    // Handle server-side errors
                    return response.json().then(data => {
                        console.error('Logout failed:', data.message || 'Unknown error');
                        alert('Logout failed: ' + (data.message || 'Unknown error'));
                    });
                }
            })
            .catch(error => {
                console.error('Error during logout:', error);
                alert('An error occurred during logout. Please try again.');
            });
        }
    }

    // Add event listener to logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    } else {
        console.error('Logout button not found');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const loggedInSubstationName = "220/132/33KV Tandur"; // Replace with actual dynamic value
    const substations = [
        { name: "220/132/33KV Tandur", subSubstations: ["33KV Basheerabad", "33KV Karankote", "33KV Tandur", "33KV Turmamidi", "33kv Yalal", "33KV Bommarspet", "33KV Peddamul", "33KV Gouthapur", "33KV Mythra Solar", "33KV Vikarabad"] },
        { name: "220KV SS Chandanavally", subSubstations: ["33KV WAMIL", "33KV WFL", "33KV Chandanvally IP"] },
        { name: "132/33KV Kodangal", subSubstations: ["33KV Dudyal", "33KV Kodangal", "33KV Peddanandigama", "33KV Hamshanpally", "33KV Kothur", "33KV Usha solar", "33KV Winsol Solar"] },
        { name: "132/33KV Kanakamamidi", subSubstations: ["33KV Kethireddypally", "33KV Kanakamamidi", "33KV CHANDANVELLY-2", "33KV CHANDANVELLY-1", "33KV Moinabad", "33KV Reddypally"] },
        { name: "132/33KVSS Parigi", subSubstations: ["33KV Rapol", "33KV Manneguda", "33KV Siddulur", "33KV Water Grid", "33KV Divya shakthy Paper Mills", "33KV Savitri-1(12-1-2010)", "33KV Pargi ( 15-10-12)", "33KV Abhiram Steel (29-10-12)", "33KV Savitri-2 (25-2-14)", "33KV Rangampally", "33 KV Poodur", "SSJ Solar Plant(1-11-2014)", "Globle Solar Plant(23-3-2016)"] },
        { name: "132/33KVSS Puttapahad", subSubstations: ["33KV Puttapahad", "33KV Chowdapur", "33KV Mothkur", "33KV Nancharla", "33KV DOMA", "33Kv Salkarpet"] },
        { name: "132/33KVSS  SRIRANGAPUR", subSubstations: ["33KV Uttharas pally", "33KV kondurg", "33KV chowdari gudem", "33kv mogili gidda", "33kv antharam", "33kv amazon", "33kv vijaya neha", "33KV binju saraya"] },
        { name: "132/33KVSS  Vikarabad", subSubstations: ["33kv siddulur", "33KV mmepl solar KOTTAGADI", "33KV mmepl solar PEERAMPALLY", "33KV MADANA PALLY", "33KV MADANA PALLY", "33 KV VIKARABAD"] },
        { name: "132/33KV Donthanpally", subSubstations: ["33KV IBS", "33KV GARGI STEELS", "33KV PRAGATHI", "33KV NANAKRAMGUDA", "33KV VATTINAGULAPALLY", "33KV NARSINGHI", "33KV CBIT", "33KV SHANKARPALLY", "33 KV MEDHA SERVO", "33kV SIFY"] }
    ];

    const feederFilter = document.getElementById('feeder-filter');
    const causeFilter = document.getElementById('cause-filter');
    const fromDateFilter = document.getElementById('from-date-filter');
    const toDateFilter = document.getElementById('to-date-filter');
    const filterButton = document.getElementById('filter-button');
    const clearFiltersButton = document.getElementById('clear-filters-button');
    const table = document.getElementById('interruption-table');

    function populateFeederFilter() {
        const feeders = new Set();

        substations.forEach(substation => {
            if (substation.name === loggedInSubstationName) {
                substation.subSubstations.forEach(feeder => feeders.add(feeder));
            }
        });

        feeders.forEach(feeder => {
            const option = document.createElement('option');
            option.value = feeder;
            option.textContent = feeder;
            feederFilter.appendChild(option);
        });
    }

    function applyFilters() {
        console.log('Applying filters...');

        const feederValue = feederFilter.value.toLowerCase();
        const causeValue = causeFilter.value.toLowerCase();
        const fromDateValue = new Date(fromDateFilter.value);
        const toDateValue = new Date(toDateFilter.value);

        console.log({ feederValue, causeValue, fromDateValue, toDateValue });

        Array.from(table.getElementsByTagName('tbody')[0].getElementsByTagName('tr')).forEach(row => {
            const feederCell = row.cells[2].textContent.toLowerCase();
            const causeCell = row.cells[3].textContent.toLowerCase();
            const fromDateCell = new Date(row.cells[4].textContent);
            const toDateCell = new Date(row.cells[5].textContent);

            console.log({ feederCell, causeCell, fromDateCell, toDateCell });

            let feederMatch = feederValue === '' || feederCell.includes(feederValue);
            let causeMatch = causeValue === '' || causeCell.includes(causeValue);
            let fromDateMatch = !fromDateFilter.value || (fromDateCell >= fromDateValue);
            let toDateMatch = !toDateFilter.value || (toDateCell <= toDateValue);

            console.log({ feederMatch, causeMatch, fromDateMatch, toDateMatch });

            if (feederMatch && causeMatch && fromDateMatch && toDateMatch) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    filterButton.addEventListener('click', applyFilters);

    clearFiltersButton.addEventListener('click', function () {
        feederFilter.value = '';
        causeFilter.value = '';
        fromDateFilter.value = '';
        toDateFilter.value = '';
        applyFilters(); // Re-apply filters to show all rows
    });

    populateFeederFilter(); // Populate the feeder filter on page load
});

document.addEventListener('DOMContentLoaded', function () {
    const sortBySelect = document.getElementById('sort-by');
    const tableBody = document.getElementById('interruption-table').getElementsByTagName('tbody')[0];

    function sortTable(columnIndex, ascending) {
        const rows = Array.from(tableBody.getElementsByTagName('tr'));
        rows.sort((a, b) => {
            const cellA = a.cells[columnIndex].textContent.trim();
            const cellB = b.cells[columnIndex].textContent.trim();

            const dateA = new Date(cellA);
            const dateB = new Date(cellB);

            if (ascending) {
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }
        });

        rows.forEach(row => tableBody.appendChild(row));
    }

    function handleSort() {
        const sortValue = sortBySelect.value;
        
        switch (sortValue) {
            case 'from-asc':
                sortTable(4, true); // Sort by "From Date and Time" ascending
                break;
            case 'from-desc':
                sortTable(4, false); // Sort by "From Date and Time" descending
                break;
            case 'to-asc':
                sortTable(5, true); // Sort by "To Date and Time" ascending
                break;
            case 'to-desc':
                sortTable(5, false); // Sort by "To Date and Time" descending
                break;
            default:
                // No sorting
                break;
        }
    }

    sortBySelect.addEventListener('change', handleSort);
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login.html'); // Redirect to login page if not authenticated
}

window.onload = function() {
    fetch('/api/check-auth') // Create an endpoint to check if the user is authenticated
        .then(response => {
            if (response.status === 401) {
                window.location.href = '/login.html'; // Redirect to login page if not authenticated
            }
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.href = '/login.html';
        });
};
