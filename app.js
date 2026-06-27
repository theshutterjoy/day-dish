document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const dashboard = document.getElementById('dashboard');
    const dayDescription = document.getElementById('day-description');
    const generationStatus = document.getElementById('generation-status');
    
    // Grid content containers
    const scheduleContent = document.getElementById('schedule-content');
    const groceryContent = document.getElementById('grocery-content');
    const substitutionsContent = document.getElementById('substitutions-content');
    const budgetContent = document.getElementById('budget-content');

    generateBtn.addEventListener('click', () => {
        if (!dayDescription.value.trim()) {
            // Simple shake animation or focus if empty
            dayDescription.focus();
            return;
        }

        // Show dashboard with skeletons
        dashboard.classList.remove('hidden');
        dashboard.classList.add('flex');
        
        // Reset state
        document.querySelectorAll('.skeleton-group').forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('.content-group').forEach(el => el.classList.add('hidden'));
        generationStatus.classList.remove('hidden');
        
        // Scroll to dashboard smoothly
        dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Simulate AI API call delay (2.5s)
        setTimeout(() => {
            populateDashboard();
        }, 2500);
    });

    function populateDashboard() {
        // Hide skeletons, show content
        document.querySelectorAll('.skeleton-group').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.content-group').forEach(el => {
            el.classList.remove('hidden');
            el.classList.add('fade-in-up');
        });
        generationStatus.classList.add('hidden');

        // 1. Schedule Data
        scheduleContent.innerHTML = `
            <label class="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                <input type="checkbox" class="custom-checkbox mt-1">
                <div class="flex flex-col">
                    <span class="text-sm font-medium text-blue-400">Breakfast (8:00 AM)</span>
                    <span class="text-white font-medium">Protein Oats & Berries</span>
                    <span class="text-xs text-slate-400 mt-1 flex items-center gap-1"><i class="ph ph-fire"></i> 450 kcal • 10 min prep</span>
                </div>
            </label>
            <label class="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                <input type="checkbox" class="custom-checkbox mt-1">
                <div class="flex flex-col">
                    <span class="text-sm font-medium text-orange-400">Lunch (1:00 PM)</span>
                    <span class="text-white font-medium">Grilled Chicken Quinoa Bowl</span>
                    <span class="text-xs text-slate-400 mt-1 flex items-center gap-1"><i class="ph ph-fire"></i> 650 kcal • 15 min prep</span>
                </div>
            </label>
            <label class="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                <input type="checkbox" class="custom-checkbox mt-1">
                <div class="flex flex-col">
                    <span class="text-sm font-medium text-emerald-400">Dinner (7:30 PM)</span>
                    <span class="text-white font-medium">Baked Salmon & Asparagus</span>
                    <span class="text-xs text-slate-400 mt-1 flex items-center gap-1"><i class="ph ph-fire"></i> 550 kcal • 25 min prep</span>
                </div>
            </label>
        `;

        // 2. Grocery List Data
        groceryContent.innerHTML = `
            <div class="flex flex-col gap-2">
                <span class="text-xs font-semibold tracking-wider text-slate-500 uppercase">Produce</span>
                <label class="flex items-center gap-3 text-sm text-slate-200 cursor-pointer hover:text-white transition-colors">
                    <input type="checkbox" class="custom-checkbox"> Mixed Berries (200g)
                </label>
                <label class="flex items-center gap-3 text-sm text-slate-200 cursor-pointer hover:text-white transition-colors">
                    <input type="checkbox" class="custom-checkbox"> Asparagus (1 bunch)
                </label>
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-xs font-semibold tracking-wider text-slate-500 uppercase">Proteins & Dairy</span>
                <label class="flex items-center gap-3 text-sm text-slate-200 cursor-pointer hover:text-white transition-colors">
                    <input type="checkbox" class="custom-checkbox"> Chicken Breast (200g)
                </label>
                <label class="flex items-center gap-3 text-sm text-slate-200 cursor-pointer hover:text-white transition-colors">
                    <input type="checkbox" class="custom-checkbox"> Salmon Fillet (150g)
                </label>
            </div>
        `;

        // 3. Substitutions Data
        substitutionsContent.innerHTML = `
            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-white/5">
                <div class="flex flex-col">
                    <span class="text-sm text-white font-medium">Chicken <i class="ph ph-arrow-right text-slate-500 text-xs mx-1"></i> Tofu</span>
                    <span class="text-xs text-slate-400">Vegetarian option (-$2.50)</span>
                </div>
                <input type="checkbox" class="toggle-switch">
            </div>
            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-white/5">
                <div class="flex flex-col">
                    <span class="text-sm text-white font-medium">Oats <i class="ph ph-arrow-right text-slate-500 text-xs mx-1"></i> Chia Pudding</span>
                    <span class="text-xs text-slate-400">Low-carb option (+$1.00)</span>
                </div>
                <input type="checkbox" class="toggle-switch">
            </div>
        `;

        // 4. Budget Status Data
        const dailyBudgetInput = document.getElementById('daily-budget').value;
        const targetBudget = dailyBudgetInput ? parseFloat(dailyBudgetInput) : 25.00;
        const estimatedCost = 18.50;
        const percentage = Math.min((estimatedCost / targetBudget) * 100, 100);
        
        // Dynamic color based on budget (green if well under, orange/red if close/over)
        let strokeColor = '#34d399'; // emerald-400
        if (percentage > 85) strokeColor = '#fbbf24'; // amber-400
        if (percentage > 100) strokeColor = '#ef4444'; // red-500

        budgetContent.innerHTML = `
            <div class="relative w-32 h-16 flex items-end justify-center overflow-hidden">
                <!-- Background Arc -->
                <svg viewBox="0 0 100 50" class="w-full h-full absolute bottom-0">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="12" stroke-linecap="round"/>
                </svg>
                <!-- Foreground Arc (Animated) -->
                <svg viewBox="0 0 100 50" class="w-full h-full absolute bottom-0">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="${strokeColor}" stroke-width="12" stroke-linecap="round" 
                          class="gauge-arc" style="stroke-dasharray: 126; stroke-dashoffset: 126;"/>
                </svg>
                <div class="absolute bottom-0 text-2xl font-display font-semibold text-white">
                    $${estimatedCost.toFixed(2)}
                </div>
            </div>
            <div class="text-center mt-2 flex flex-col gap-1">
                <span class="text-sm text-slate-300">Estimated Daily Cost</span>
                <span class="text-xs text-slate-400">Target: $${targetBudget.toFixed(2)} (${percentage.toFixed(0)}%)</span>
            </div>
        `;

        // Trigger gauge animation on next frame
        requestAnimationFrame(() => {
            const gauge = budgetContent.querySelector('.gauge-arc');
            if (gauge) {
                // Total length of semi-circle is approx 126 (pi * r = 3.14 * 40)
                const offset = 126 - (126 * percentage / 100);
                gauge.style.strokeDashoffset = Math.max(0, offset);
            }
        });
    }
});
