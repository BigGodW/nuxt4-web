<template>
    <div>
        <div class="navbar bg-base-100 shadow-sm">
            <div class="flex-1">
                <NuxtLink to="/" class="btn btn-ghost text-xl">WUBUG</NuxtLink>
            </div>
            <div class="flex-none">
                <details class="dropdown dropdown-end dropdown-hover">
                    <summary class="btn btn-square btn-ghost"><span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                class="inline-block h-5 w-5 stroke-current">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z">
                                </path>
                            </svg>
                        </span></summary>
                    <NavList></NavList>
                </details>
            </div>
        </div>
    </div>
</template>