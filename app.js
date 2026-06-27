document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const dashboard = document.getElementById('dashboard');
    const dayDescription = document.getElementById('day-description');
    const dailyBudgetInput = document.getElementById('daily-budget');
    const currencySelect = document.getElementById('currency-select');
    const generationStatus = document.getElementById('generation-status');
    
    // Grid content containers
    const scheduleContent = document.getElementById('schedule-content');
    const groceryContent = document.getElementById('grocery-content');
    const substitutionsContent = document.getElementById('substitutions-content');
    const budgetContent = document.getElementById('budget-content');

    const GEMINI_API_KEY = "AQ.Ab8RN6KAHLeFQ9I1rD8tzyosiB9vysf_bwPbyVrLY82jeqndWA";
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    generateBtn.addEventListener('click', async () => {
        const context = dayDescription.value.trim();
        const budget = dailyBudgetInput.value.trim() || '25';
        const currency = currencySelect ? currencySelect.value : '$';

        if (!context) {
            dayDescription.focus();
            return;
        }

        // Show dashboard with skeletons
        dashboard.classList.remove('hidden');
        dashboard.classList.add('flex');
        
        // Reset state
        document.querySelectorAll('.skeleton-group').forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('.content-group').forEach(el => el.classList.add('hidden'));
        generationStatus.innerHTML = `<i class="ph ph-spinner-gap animate-spin"></i> Generating...`;
        generationStatus.classList.remove('text-red-400');
        generationStatus.classList.add('text-accent-400');
        generationStatus.classList.remove('hidden');
        
        // Scroll to dashboard smoothly
        dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        try {
            const requestBody = {
                "system_instruction": {
                    "parts": [
                        {
                            "text": "You are an elite culinary planner and financial advisor. Analyze the user's daily schedule and constraints to output a strictly structured JSON containing: \n1. mealPlan: Specific, fast, context-appropriate meals for Breakfast, Lunch, and Dinner matching their day. Each meal must have 'name', 'calories' (e.g. '450 kcal'), and 'prepTime' (e.g. '10 min').\n2. groceryList: Every raw ingredient needed, grouped by category (e.g., 'Produce', 'Pantry', 'Dairy'). The value for each category should be an array of strings.\n3. substitutions: At least two alternative swap suggestions for key ingredients. Each swap must have 'original', 'swap', and 'reason'.\n4. budgetAnalysis: calculate total estimated grocery cost vs user budget. Must contain 'totalCost' (number), 'feasible' (boolean flag), and 'justification' (short string)."
                        }
                    ]
                },
                "contents": [
                    {
                        "parts": [
                            {
                                "text": `User Context: ${context}\nDaily Budget: ${currency}${budget}`
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "responseMimeType": "application/json"
                }
            };

            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const aiText = data.candidates[0].content.parts[0].text;
            const parsedData = JSON.parse(aiText);

            populateDashboard(parsedData, parseFloat(budget), currency);
        } catch (error) {
            console.error("Error generating meal plan:", error);
            generationStatus.innerHTML = `<i class="ph ph-warning"></i> Error generating plan. Try again.`;
            generationStatus.classList.remove('text-accent-400');
            generationStatus.classList.add('text-red-400');
            // Hide skeletons on error
            document.querySelectorAll('.skeleton-group').forEach(el => el.classList.add('hidden'));
        }
    });

    function populateDashboard(data, targetBudget, currency) {
        // Hide skeletons, show content
        document.querySelectorAll('.skeleton-group').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.content-group').forEach(el => {
            el.classList.remove('hidden');
            el.classList.add('fade-in-up');
        });
        generationStatus.classList.add('hidden');

        // 1. Schedule Data
        const meals = data.mealPlan || {};
        const mealHTML = Object.entries(meals).map(([mealType, details]) => {
            let color = 'text-blue-400';
            let time = '8:00 AM';
            if (mealType.toLowerCase().includes('lunch')) { color = 'text-orange-400'; time = '1:00 PM'; }
            if (mealType.toLowerCase().includes('dinner')) { color = 'text-emerald-400'; time = '7:30 PM'; }
            
            return `
                <label class="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                    <input type="checkbox" class="custom-checkbox mt-1">
                    <div class="flex flex-col">
                        <span class="text-sm font-medium ${color} capitalize">${mealType} (${time})</span>
                        <span class="text-white font-medium meal-item-name">${details.name}</span>
                        <span class="text-xs text-slate-400 mt-1 flex items-center gap-1"><i class="ph ph-fire"></i> ${details.calories} • ${details.prepTime}</span>
                    </div>
                </label>
            `;
        }).join('');
        scheduleContent.innerHTML = mealHTML;

        // 2. Grocery List Data
        const groceries = data.groceryList || {};
        const groceryHTML = Object.entries(groceries).map(([category, items]) => {
            const itemsList = Array.isArray(items) ? items.map(item => `
                <label class="flex items-center gap-3 text-sm text-slate-200 cursor-pointer hover:text-white transition-colors">
                    <input type="checkbox" class="custom-checkbox"> <span class="grocery-item-name">${item}</span>
                </label>
            `).join('') : '';
            
            return `
                <div class="flex flex-col gap-2 mb-2">
                    <span class="text-xs font-semibold tracking-wider text-slate-500 uppercase">${category}</span>
                    ${itemsList}
                </div>
            `;
        }).join('');
        groceryContent.innerHTML = groceryHTML;

        // 3. Substitutions Data & Logic
        const subs = data.substitutions || [];
        const subsHTML = subs.map(sub => `
            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-white/5">
                <div class="flex flex-col flex-1 pr-4">
                    <span class="text-sm text-white font-medium flex items-center flex-wrap gap-1">
                        ${sub.original} <i class="ph ph-arrow-right text-slate-500 text-xs"></i> ${sub.swap}
                    </span>
                    <span class="text-xs text-slate-400 mt-1">${sub.reason}</span>
                </div>
                <input type="checkbox" class="toggle-switch flex-shrink-0">
            </div>
        `).join('');
        substitutionsContent.innerHTML = subsHTML;

        // Setup real-time toggle logic
        const toggleSwitches = substitutionsContent.querySelectorAll('.toggle-switch');
        toggleSwitches.forEach((toggle, index) => {
            toggle.addEventListener('change', (e) => {
                const sub = subs[index];
                const isChecked = e.target.checked;
                const searchFor = isChecked ? sub.original : sub.swap;
                const replaceWith = isChecked ? sub.swap : sub.original;
                
                // Helper to replace text safely in nodes
                const replaceInNodes = (selector) => {
                    document.querySelectorAll(selector).forEach(node => {
                        const regex = new RegExp(searchFor, 'gi'); // Case-insensitive
                        if (regex.test(node.textContent)) {
                            // Only update text content, keep HTML structure safe
                            // For simplicity, since we just have inner spans, we can replace directly
                            node.textContent = node.textContent.replace(regex, replaceWith);
                        }
                    });
                };

                // Update schedule names and grocery items dynamically
                replaceInNodes('.meal-item-name');
                replaceInNodes('.grocery-item-name');
            });
        });

        // 4. Budget Status Data
        const analysis = data.budgetAnalysis || { totalCost: 0, feasible: true, justification: "" };
        const estimatedCost = parseFloat(analysis.totalCost);
        const percentage = Math.min((estimatedCost / targetBudget) * 100, 100) || 0;
        
        let strokeColor = '#34d399'; // emerald-400
        if (percentage > 85) strokeColor = '#fbbf24'; // amber-400
        if (!analysis.feasible || percentage > 100) strokeColor = '#ef4444'; // red-500

        budgetContent.innerHTML = `
            <div class="relative w-32 h-16 flex items-end justify-center overflow-hidden">
                <svg viewBox="0 0 100 50" class="w-full h-full absolute bottom-0">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="12" stroke-linecap="round"/>
                </svg>
                <svg viewBox="0 0 100 50" class="w-full h-full absolute bottom-0">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="${strokeColor}" stroke-width="12" stroke-linecap="round" 
                          class="gauge-arc" style="stroke-dasharray: 126; stroke-dashoffset: 126;"/>
                </svg>
                <div class="absolute bottom-0 text-2xl font-display font-semibold text-white">
                    ${currency}${estimatedCost.toFixed(2)}
                </div>
            </div>
            <div class="text-center mt-2 flex flex-col gap-1 w-full">
                <span class="text-sm text-slate-300">Estimated Cost</span>
                <span class="text-xs ${analysis.feasible ? 'text-emerald-400' : 'text-red-400'} font-medium">
                    ${analysis.feasible ? 'Under Budget' : 'Over Budget'}
                </span>
                <span class="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">${analysis.justification}</span>
            </div>
        `;

        requestAnimationFrame(() => {
            const gauge = budgetContent.querySelector('.gauge-arc');
            if (gauge) {
                const offset = 126 - (126 * percentage / 100);
                gauge.style.strokeDashoffset = Math.max(0, offset);
            }
        });
    }
});
