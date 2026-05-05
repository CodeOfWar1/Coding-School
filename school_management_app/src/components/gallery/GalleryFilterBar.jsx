import { FaChevronDown, FaFilter } from 'react-icons/fa'

function formatCategoryLabel(category) {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

export default function GalleryFilterBar({
  categories,
  selectedCategory,
  setSelectedCategory,
  filteredCount,
  totalCount,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-2xl font-black text-[#2d3f5d]">{filteredCount}</span>
            <span className="text-gray-500 ml-1">Photos</span>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div>
            <span className="text-2xl font-black text-[#2d3f5d]">{totalCount}</span>
            <span className="text-gray-500 ml-1">Total</span>
          </div>
        </div>

        <div className="relative w-full sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-[#2d3f5d] to-[#1a2542] text-white shadow-md"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <FaFilter className="text-[#faa853]" />
              {formatCategoryLabel(selectedCategory)}
            </span>
            <FaChevronDown
              className={`text-[#faa853] transition-transform duration-300 ${mobileMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {mobileMenuOpen && (
            <div className="absolute z-20 mt-2 w-full rounded-2xl border border-[#2d3f5d]/15 bg-white p-3 shadow-xl animate-fade-in-up">
              <p className="text-xs font-semibold text-gray-500 mb-2 px-1">Choose what to view</p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      selectedCategory === category
                        ? 'bg-[#faa853] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {formatCategoryLabel(category)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden sm:flex sm:flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-[#faa853] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {formatCategoryLabel(category)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
