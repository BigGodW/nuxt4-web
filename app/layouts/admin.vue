<template>
    <div>
        <admin-header></admin-header>
        <div class="flex">
            <admin-nav class=" flex-none bg-amber-50 h-full"></admin-nav>
            <div class=" bg-blue-50 flex-1">
                <slot></slot>
            </div>
        </div>
    </div>
</template>